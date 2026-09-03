import type { ConnectionRecord, DialectSession, QueryResult, RunQueryOptions } from '../types.ts'
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { DbConsoleError, wrapError } from '../errors.ts'
import { serializeCell } from '../serialize.ts'
import { isReadOnlyStatement, normalizeSchema, quoteMySql, splitStatements , capReadSelect, escapeLike } from '../sqlutil.ts'

interface MysqlRow extends RowDataPacket {
  [key: string]: unknown
}

export function createMysqlSession(record: ConnectionRecord): DialectSession {
  let pool: Awaited<ReturnType<typeof import('mysql2/promise').createPool>> | null = null

  const targetSchema = (schema?: string): string => normalizeSchema(schema) ?? normalizeSchema(record.schema) ?? record.database ?? ''

  return {
    schemaAware: false,
    async open() {
      if (pool) return
      const { createPool } = await import('mysql2/promise')
      const candidate = createPool({
        host: record.host,
        port: record.port ?? 3306,
        user: record.user,
        password: record.password,
        database: record.database || undefined,
        waitForConnections: true,
        connectionLimit: 2,
        connectTimeout: 8_000,
        // 允许一条文本里含多条语句（只读模式下会被本插件拦截）
        multipleStatements: true,
        ...(record.ssl ? { ssl: { rejectUnauthorized: false } } : {}),
        ...(record.options && record.options.sslCa
          ? { ssl: { ca: record.options.sslCa } }
          : {}),
      })
      try {
        await candidate.query('select 1 as ok')
      } catch (reason) {
        await candidate.end().catch(() => undefined)
        throw wrapError(
          reason,
          `无法连接 MySQL（${record.host ?? '?'}:${record.port ?? 3306}），请检查地址、端口、账号与网络`,
          'MYSQL_CONNECT',
          502,
        )
      }
      pool = candidate
    },
    async close() {
      if (!pool) return
      const current = pool
      pool = null
      await current.end().catch(() => undefined)
    },
    async listSchemas() {
      const [rows] = await current().query<MysqlRow[]>(
        `select schema_name as name from information_schema.schemata
         where schema_name not in ('information_schema','performance_schema','mysql','sys')
         order by schema_name`,
      )
      return rows.map((row) => ({ name: String(row.name), kind: 'database' as const }))
    },
    async listDatabases() {
      const [rows] = await current().query<MysqlRow[]>(
        `select schema_name as name from information_schema.schemata
         where schema_name not in ('information_schema','performance_schema','mysql','sys')
         order by schema_name`,
      )
      return rows.map((row) => String(row.name))
    },
    async listTables(schema) {
      const db = targetSchema(schema)
      const [rows] = await current().query<MysqlRow[]>(
        `select table_name as name, table_type as table_type
         from information_schema.tables
         where table_schema = ?
         order by table_name`,
        [db],
      )
      return rows.map((row) => ({
        name: String(row.name),
        kind: row.table_type === 'VIEW' ? ('view' as const) : ('table' as const),
      }))
    },
    async tableColumns(table, schema) {
      const db = targetSchema(schema)
      const [rows] = await current().query<MysqlRow[]>(
        `select c.column_name as column_name,
                c.column_type as column_type,
                c.is_nullable as is_nullable,
                c.column_default as column_default,
                c.column_key as column_key,
                c.column_comment as column_comment
         from information_schema.columns c
         where c.table_schema = ? and c.table_name = ?
         order by c.ordinal_position`,
        [db, table],
      )
      return rows.map((row) => ({
        name: String(row.column_name),
        type: String(row.column_type ?? ''),
        nullable: String(row.is_nullable ?? 'NO') === 'YES',
        primary: String(row.column_key ?? '') === 'PRI',
        defaultValue: row.column_default === null || row.column_default === undefined ? null : String(row.column_default),
        comment: row.column_comment ? String(row.column_comment) : undefined,
      }))
    },
    async preview(table, schema, limit, offset, options) {
      const db = targetSchema(schema)
      const safeLimit = clampInt(limit, 1, 100_000)
      const safeOffset = Math.max(0, Math.trunc(offset) || 0)
      const where: string[] = []
      const values: unknown[] = []
      for (const [name, raw] of Object.entries(options?.filters ?? {})) {
        const text = String(raw ?? '').trim()
        if (!text || name.length > 128) continue
        where.push(`${quoteMySql(name)} like ? escape '\\'`)
        values.push(`%${escapeLike(text)}%`)
      }
      const order = options?.sort?.column
        ? ` order by ${quoteMySql(options.sort.column)} ${options.sort.dir === 'desc' ? 'desc' : 'asc'}`
        : ''
      const want = safeLimit + 1
      const sql = `select * from ${quoteMySql(db)}.${quoteMySql(table)}${where.length > 0 ? ` where ${where.join(' and ')}` : ''}${order} limit ${want} offset ${safeOffset}`
      const result = await runSql(sql, values, true)
      const fetched = result.rows.length
      if (fetched > safeLimit) {
        result.rows = result.rows.slice(0, safeLimit)
        result.truncated = true
      } else {
        result.truncated = false
      }
      result.rowCount = result.rows.length
      result.total = fetched > safeLimit ? undefined : safeOffset + fetched
      return result
    },
    async updateCell(input) {
      if (input.pk.length === 0) throw new DbConsoleError('缺少主键，无法定位要更新的行', 'CELL_NO_PK', 400)
      const db = targetSchema(input.schema)
      const sql = `update ${quoteMySql(db)}.${quoteMySql(input.table)}
        set ${quoteMySql(input.column)} = ?
        where ${input.pk.map((entry) => `${quoteMySql(entry.column)} = ?`).join(' and ')}`
      const conn = await current().getConnection()
      try {
        const [header] = await conn.query(sql, [input.value, ...input.pk.map((entry) => entry.value)])
        const affected = typeof (header as ResultSetHeader).affectedRows === 'number' ? Number((header as ResultSetHeader).affectedRows) : 0
        return { affectedRows: affected }
      } catch (reason) {
        throw wrapError(reason, '单元格更新失败', 'MYSQL_UPDATE', 502)
      } finally {
        conn.release()
      }
    },
    async runQuery(options) {
      // 只读模式：必须单条且只读；可写模式：允许按分号拆分的多条语句顺序执行
      const statements = splitStatements(options.sql)
      if (statements.length === 0) throw new DbConsoleError('SQL 为空', 'EMPTY_SQL', 400)
      if (options.readOnly) {
        if (statements.length > 1) {
          throw new DbConsoleError('只读模式仅允许单条语句（请去掉多余分号或拆开执行）', 'WRITE_BLOCKED', 400)
        }
        if (!isReadOnlyStatement(statements[0] ?? '')) {
          throw new DbConsoleError('只读模式禁止执行非查询语句（如需写入，请取消“只读”开关后重试）', 'WRITE_BLOCKED', 400)
        }
      }
      let cappedNote: string | null = null
      if (options.readOnly) {
        const plan = capReadSelect(statements[0] ?? '', options.hardLimit)
        if (plan.capped) {
          statements[0] = plan.sql
          cappedNote = `结果已自动限制为前 ${options.hardLimit} 行（原语句未写 LIMIT）。如需更多，调大“每页数量”后重新执行。`
        }
      }
      const params = options.params ?? []
      let last: QueryResult | null = null
      let totalAffected = 0
      let totalRows = 0
      const started = Date.now()
      for (const statement of statements) {
        const result = await runSql(statement, params, options.readOnly === true)
        totalAffected += result.affectedRows ?? 0
        totalRows += result.rowCount
        last = result
        if (params.length > 0) break // 参数只作用于第一条语句（后续重复使用不安全）
      }
      if (!last) throw new DbConsoleError('SQL 为空', 'EMPTY_SQL', 400)
      const durationMs = Date.now() - started
      if (statements.length > 1) {
        return {
          ...last,
          rows: last.kind === 'select' ? last.rows : [],
          rowCount: totalRows,
          affectedRows: totalAffected,
          durationMs,
          truncated: last.truncated,
          message: `已顺序执行 ${statements.length} 条语句${totalAffected ? `，共影响 ${totalAffected} 行` : ''}`,
        }
      }
      if (cappedNote && last) return { ...last, durationMs, message: cappedNote }
      return { ...last, durationMs }
    },
  }

  async function runSql(sql: string, values: unknown[], readOnly: boolean): Promise<QueryResult> {
    const started = Date.now()
    let raw: [MysqlRow[] | ResultSetHeader, unknown[]]
    try {
      const conn = await current().getConnection()
      try {
        raw = (await conn.query(sql, values)) as [MysqlRow[] | ResultSetHeader, unknown[]]
      } finally {
        conn.release()
      }
    } catch (reason) {
      throw wrapError(reason, 'SQL 执行失败', 'MYSQL_QUERY', 502)
    }
    const durationMs = Date.now() - started
    const [result, fields] = raw
    const columns: string[] = Array.isArray(fields)
      ? (fields as Array<{ name?: string }>).map((field) => String(field?.name ?? ''))
      : []
    const affected = typeof (result as ResultSetHeader).affectedRows === 'number'
      ? Number((result as ResultSetHeader).affectedRows)
      : undefined
    if (Array.isArray(result)) {
      let rows = (result as MysqlRow[]).map((row) => columns.map((column) => serializeCell(row[column])))
      const truncated = rows.length > 10_000
      if (truncated) rows = rows.slice(0, 10_000)
      return {
        columns,
        rows,
        rowCount: rows.length,
        durationMs,
        truncated,
        kind: 'select',
        ...(readOnly ? {} : { affectedRows: affected ?? 0 }),
      }
    }
    const header = result as ResultSetHeader
    const kind = header.affectedRows !== undefined ? 'change' : 'other'
    return {
      columns,
      rows: [],
      rowCount: 0,
      affectedRows: kind === 'change' ? Number(header.affectedRows) : undefined,
      durationMs,
      truncated: false,
      kind,
      message: kind === 'change' ? `影响行数：${Number(header.affectedRows)}` : '语句已执行（无返回结果集）',
    }
  }

  function current(): Awaited<ReturnType<typeof import('mysql2/promise').createPool>> {
    if (!pool) throw new DbConsoleError('MySQL 会话尚未打开', 'NOT_OPEN', 500)
    return pool
  }
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.trunc(value)))
}
