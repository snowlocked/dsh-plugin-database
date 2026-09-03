import type { Pool as PgPool, PoolConfig, QueryResult as PgQueryResult } from 'pg'
import type {
  ConnectionRecord, DialectSession, QueryResult, RunQueryOptions,
} from '../types.ts'
import { DbConsoleError, wrapError } from '../errors.ts'
import { serializeCell } from '../serialize.ts'
import { isReadOnlyStatement, normalizeSchema, quotePg, singleStatement , capReadSelect, escapeLike } from '../sqlutil.ts'

export function createPostgresSession(record: ConnectionRecord): DialectSession {
  let pool: PgPool | null = null

  const defaultSchema = (): string => normalizeSchema(record.schema) ?? 'public'
  const targetSchema = (schema?: string): string => normalizeSchema(schema) ?? defaultSchema()

  return {
    schemaAware: true,
    async open() {
      if (pool) return
      const { Pool: RealPool } = await import('pg')
      const config: PoolConfig = {
        host: record.host,
        port: record.port ?? 5432,
        user: record.user,
        password: record.password,
        database: record.database || undefined,
        max: 2,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 8_000,
        ...(record.ssl ? { ssl: { rejectUnauthorized: false } } : {}),
      }
      const candidate = new RealPool(config)
      try {
        await candidate.query('select 1 as ok')
      } catch (reason) {
        await candidate.end().catch(() => undefined)
        throw wrapError(
          reason,
          `无法连接 PostgreSQL（${record.host ?? '?'}:${record.port ?? 5432}），请检查地址、端口、账号与网络`,
          'PG_CONNECT',
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
      const result = await current().query<{ nspname: string }>(
        `select nspname from pg_namespace
         where nspname !~ '^pg_' and nspname <> 'information_schema'
         order by nspname`,
      )
      return result.rows.map((row) => ({ name: row.nspname, kind: 'schema' as const }))
    },
    async listDatabases() {
      const result = await current().query<{ datname: string }>(
        `select datname from pg_database
         where datistemplate = false
         order by datname`,
      )
      return result.rows.map((row) => row.datname)
    },
    async listTables(schema) {
      const target = targetSchema(schema)
      const result = await current().query<{ table_name: string; table_type: string }>(
        `select table_name, table_type from information_schema.tables
         where table_schema = $1 order by table_name`,
        [target],
      )
      return result.rows.map((row) => ({
        name: row.table_name,
        kind: row.table_type === 'VIEW' ? ('view' as const) : ('table' as const),
      }))
    },
    async tableColumns(table, schema) {
      const target = targetSchema(schema)
      const result = await current().query<{
        column_name: string
        data_type: string
        is_nullable: string
        column_default: string | null
        character_maximum_length: number | null
        is_primary: boolean | null
      }>(
        `select c.column_name,
                c.data_type,
                c.is_nullable,
                c.column_default,
                c.character_maximum_length,
                (exists (
                   select 1 from information_schema.table_constraints tc
                   join information_schema.key_column_usage kcu
                     on tc.constraint_name = kcu.constraint_name
                    and tc.table_schema = kcu.table_schema
                  where tc.table_schema = c.table_schema
                    and tc.table_name = c.table_name
                    and tc.constraint_type = 'PRIMARY KEY'
                    and kcu.column_name = c.column_name
                )) as is_primary
         from information_schema.columns c
         where c.table_schema = $1 and c.table_name = $2
         order by c.ordinal_position`,
        [target, table],
      )
      return result.rows.map((row) => ({
        name: row.column_name,
        type: row.character_maximum_length
          ? `${row.data_type}(${row.character_maximum_length})`
          : row.data_type,
        nullable: row.is_nullable === 'YES',
        primary: row.is_primary === true,
        defaultValue: row.column_default,
      }))
    },
    async preview(table, schema, limit, offset, options) {
      const target = targetSchema(schema)
      const safeLimit = clampInt(limit, 1, 100_000)
      const safeOffset = Math.max(0, Math.trunc(offset) || 0)
      const where: string[] = []
      const values: unknown[] = []
      for (const [name, raw] of Object.entries(options?.filters ?? {})) {
        const text = String(raw ?? '').trim()
        if (!text || name.length > 128) continue
        where.push(`${quotePg(name)} ilike $${values.length + 1} escape '\\'`)
        values.push(`%${escapeLike(text)}%`)
      }
      const order = options?.sort?.column
        ? ` order by ${quotePg(options.sort.column)} ${options.sort.dir === 'desc' ? 'desc' : 'asc'}`
        : ''
      const want = safeLimit + 1
      const sql = `select * from ${quotePg(target)}.${quotePg(table)}${where.length > 0 ? ` where ${where.join(' and ')}` : ''}${order} limit ${want} offset ${safeOffset}`
      const result = await runTimed(() => current().query({ text: sql, values }))
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
      const target = targetSchema(input.schema)
      const sql = `update ${quotePg(target)}.${quotePg(input.table)}
        set ${quotePg(input.column)} = $1
        where ${input.pk.map((entry, index) => `${quotePg(entry.column)} = $${index + 2}`).join(' and ')}`
      const values = [input.value, ...input.pk.map((entry) => entry.value)]
      let result: PgQueryResult
      try {
        result = await current().query({ text: sql, values })
      } catch (reason) {
        throw wrapError(reason, '单元格更新失败', 'PG_UPDATE', 502)
      }
      return { affectedRows: typeof result.rowCount === 'number' ? result.rowCount : 0 }
    },
    async runQuery(options) {
      const statement = checkStatement(options)
      const capPlan = options.readOnly
        ? capReadSelect(statement, options.hardLimit)
        : { sql: statement, capped: false }
      const result = await runTimed(
        () => current().query({ text: capPlan.sql, values: options.params ?? [] }),
        options.hardLimit,
      )
      if (capPlan.capped) {
        result.message = `结果已自动限制为前 ${options.hardLimit} 行（原语句未写 LIMIT）。如需更多，调大“每页数量”后重新执行。`
      }
      return result
    },
  }

  function current(): PgPool {
    if (!pool) throw new DbConsoleError('PostgreSQL 会话尚未打开', 'NOT_OPEN', 500)
    return pool
  }
}

/** 校验只读/单语句约束，返回可执行语句。 */
function checkStatement(options: RunQueryOptions): string {
  const statement = singleStatement(options.sql)
  if (!statement) throw new DbConsoleError('SQL 为空', 'EMPTY_SQL', 400)
  if (options.readOnly && !isReadOnlyStatement(statement)) {
    throw new DbConsoleError('只读模式禁止执行非查询语句（如需写入，请取消“只读”开关后重试）', 'WRITE_BLOCKED', 400)
  }
  return statement
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.trunc(value)))
}

async function runTimed<T>(task: () => Promise<PgQueryResult>, hardLimit = 100_000): Promise<QueryResult> {
  const started = Date.now()
  let result: PgQueryResult
  try {
    result = await task()
  } catch (reason) {
    throw wrapError(reason, 'SQL 执行失败', 'PG_QUERY', 502)
  }
  const durationMs = Date.now() - started
  return queryResultFromPg(result, hardLimit, durationMs)
}

function queryResultFromPg(result: PgQueryResult, hardLimit: number, durationMs: number): QueryResult {
  const columns = result.fields.map((field) => field.name)
  let rows = result.rows.map((row) => columns.map((column) => serializeCell(row[column])))
  const truncated = rows.length > hardLimit
  if (truncated) rows = rows.slice(0, hardLimit)
  const command = (result.command ?? '').toUpperCase()
  const kind = command.startsWith('SELECT') || command.startsWith('WITH') || command.startsWith('SHOW')
    ? ('select' as const)
    : command.startsWith('INSERT') || command.startsWith('UPDATE') || command.startsWith('DELETE')
      ? ('change' as const)
      : ('other' as const)
  const rowCount = Array.isArray(result.rows) ? result.rows.length : 0
  const affectedRows = typeof result.rowCount === 'number' ? result.rowCount : undefined
  return {
    columns,
    rows,
    rowCount,
    affectedRows,
    durationMs,
    truncated,
    kind,
    ...(affectedRows !== undefined && kind === 'change' ? { message: `影响行数：${affectedRows}` } : {}),
  }
}

