import { existsSync } from 'node:fs'
import { isAbsolute, join } from 'node:path'
import type { DatabaseSync, SQLInputValue } from 'node:sqlite'
import type { ConnectionRecord, DialectSession, QueryResult, RunQueryOptions } from '../types.ts'
import { DbConsoleError, wrapError } from '../errors.ts'
import { serializeCell } from '../serialize.ts'
import { isReadOnlyStatement, quoteSqlite, splitStatements , capReadSelect, escapeLike } from '../sqlutil.ts'

export function createSqliteSession(record: ConnectionRecord): DialectSession {
  let db: DatabaseSync | null = null

  return {
    schemaAware: false,
    async open() {
      if (db) return
      const path = resolveSqlitePath(record)
      const { DatabaseSync: RealDatabaseSync } = await import('node:sqlite')
      const candidate = new RealDatabaseSync(path)
      try {
        candidate.exec('select 1')
      } catch (reason) {
        try { candidate.close() } catch { /* ignore */ }
        throw wrapError(reason, `无法打开 SQLite 数据库：${path}`, 'SQLITE_OPEN', 502)
      }
      db = candidate
    },
    async close() {
      if (!db) return
      const currentDb = db
      db = null
      try {
        currentDb.close()
      } catch (reason) {
        throw wrapError(reason, '关闭 SQLite 失败', 'SQLITE_CLOSE', 500)
      }
    },
    async listSchemas() {
      return []
    },
    async listTables() {
      const rows = current().prepare(
        `select name as name, type as type from sqlite_master
         where type in ('table','view') and name not like 'sqlite_%'
         order by name`,
      ).all() as Array<{ name: string; type: string }>
      return rows.map((row) => ({
        name: row.name,
        kind: row.type === 'view' ? ('view' as const) : ('table' as const),
      }))
    },
    async tableColumns(table) {
      const rows = current().prepare(`pragma table_info(${quoteSqlite(table)})`).all() as Array<{
        cid: number
        name: string
        type: string
        notnull: number
        dflt_value: unknown
        pk: number
      }>
      return rows.map((row) => ({
        name: row.name,
        type: String(row.type || ''),
        nullable: row.notnull === 0,
        primary: row.pk > 0,
        defaultValue: row.dflt_value === null || row.dflt_value === undefined ? null : String(row.dflt_value),
      }))
    },
    async preview(table, _schema, limit, offset, options) {
      const safeLimit = clampInt(limit, 1, 100_000)
      const safeOffset = Math.max(0, Math.trunc(offset) || 0)
      const where: string[] = []
      const values: unknown[] = []
      for (const [name, raw] of Object.entries(options?.filters ?? {})) {
        const text = String(raw ?? '').trim()
        if (!text || name.length > 128) continue
        where.push(`${quoteSqlite(name)} like ? escape '\\'`)
        values.push(`%${escapeLike(text)}%`)
      }
      const order = options?.sort?.column
        ? ` order by ${quoteSqlite(options.sort.column)} ${options.sort.dir === 'desc' ? 'desc' : 'asc'}`
        : ''
      const want = safeLimit + 1
      const sql = `select * from ${quoteSqlite(table)}${where.length > 0 ? ` where ${where.join(' and ')}` : ''}${order} limit ${want} offset ${safeOffset}`
      const result = run(sql, values, true)
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
      const sql = `update ${quoteSqlite(input.table)}
        set ${quoteSqlite(input.column)} = ?
        where ${input.pk.map((entry) => `${quoteSqlite(entry.column)} = ?`).join(' and ')}`
      try {
        const prepared = current().prepare(sql)
        const info = prepared.run(...toInputs([input.value, ...input.pk.map((entry) => entry.value)]))
        return { affectedRows: Number(info.changes) }
      } catch (reason) {
        throw wrapError(reason, '单元格更新失败', 'SQLITE_UPDATE', 502)
      }
    },
    async runQuery(options) {
      const statements = splitStatements(options.sql)
      if (statements.length === 0) throw new DbConsoleError('SQL 为空', 'EMPTY_SQL', 400)
      const readOnly = options.readOnly === true
      if (readOnly) {
        if (statements.length > 1) {
          throw new DbConsoleError('只读模式仅允许单条语句（请去掉多余分号或拆开执行）', 'WRITE_BLOCKED', 400)
        }
        if (!isReadOnlyStatement(statements[0] ?? '')) {
          throw new DbConsoleError('只读模式禁止执行非查询语句（如需写入，请取消“只读”开关后重试）', 'WRITE_BLOCKED', 400)
        }
      }
      if (!readOnly && statements.length > 1) {
        if (options.params && options.params.length > 0) {
          throw new DbConsoleError('批量执行时不能携带参数，请逐条执行', 'PARAMS_MULTI', 400)
        }
        const started = Date.now()
        try {
          current().exec(options.sql)
        } catch (reason) {
          throw wrapError(reason, 'SQL 执行失败', 'SQLITE_QUERY', 502)
        }
        return {
          columns: [],
          rows: [],
          rowCount: 0,
          durationMs: Date.now() - started,
          truncated: false,
          kind: 'change',
          message: `已顺序执行 ${statements.length} 条语句`,
        }
      }
      const statement = statements[0] ?? ''
      const capPlan = readOnly ? capReadSelect(statement, options.hardLimit) : { sql: statement, capped: false }
      const result = run(capPlan.sql, options.params ?? [], readOnly)
      if (capPlan.capped) {
        result.message = `结果已自动限制为前 ${options.hardLimit} 行（原语句未写 LIMIT）。如需更多，调大“每页数量”后重新执行。`
      }
      return result
    },
  }

  function run(sql: string, params: unknown[], readOnly: boolean): QueryResult {
    const started = Date.now()
    try {
      const conn = current()
      const firstWord = /^\s*(select|with|pragma|explain)/iu.exec(sql)?.[1]?.toLowerCase()
      if (firstWord && readOnly) {
        const prepared = conn.prepare(sql)
        const rowsRaw = prepared.all(...toInputs(params)) as unknown[]
        return toResult(rowsRaw, Date.now() - started)
      }
      const prepared = conn.prepare(sql)
      let info: { changes: number | bigint }
      let rowsRaw: unknown[] | null = null
      const isQuery = firstWord === 'select' || firstWord === 'with'
      if (isQuery) {
        rowsRaw = prepared.all(...toInputs(params)) as unknown[]
        info = { changes: 0n }
      } else {
        const runResult = prepared.run(...toInputs(params))
        info = { changes: runResult.changes }
      }
      if (rowsRaw) {
        const result = toResult(rowsRaw, Date.now() - started)
        return { ...result, affectedRows: 0 }
      }
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        affectedRows: Number(info.changes),
        durationMs: Date.now() - started,
        truncated: false,
        kind: 'change',
        message: `影响行数：${Number(info.changes)}`,
      }
    } catch (reason) {
      throw wrapError(reason, 'SQL 执行失败', 'SQLITE_QUERY', 502)
    }
  }

  function current(): DatabaseSync {
    if (!db) throw new DbConsoleError('SQLite 会话尚未打开', 'NOT_OPEN', 500)
    return db
  }
}

function toResult(rowsRaw: unknown[], durationMs: number): QueryResult {
  const objects = rowsRaw as Array<Record<string, unknown>>
  const columns = objects.length > 0 ? Object.keys(objects[0] ?? {}) : []
  const rows = objects.map((object) => columns.map((column) => serializeCell(object[column])))
  return {
    columns,
    rows,
    rowCount: rows.length,
    durationMs,
    truncated: false,
    kind: 'select',
  }
}

function resolveSqlitePath(record: ConnectionRecord): string {
  const raw = record.file?.trim()
  if (!raw) throw new DbConsoleError('SQLite 连接缺少数据库文件路径', 'INVALID_CONNECTION', 400)
  const candidates = isAbsolute(raw)
    ? [raw]
    : [raw, join(process.cwd(), raw), join(process.env.HOME || process.env.USERPROFILE || '.', raw)]
  const found = candidates.find((candidate) => existsSync(candidate))
  if (!found) {
    throw new DbConsoleError(`SQLite 文件不存在：${raw}`, 'SQLITE_FILE_MISSING', 400)
  }
  return found
}

function toInputs(params: unknown[]): SQLInputValue[] {
  return params.map((value) => {
    if (value === null || value === undefined) return null
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') return value
    if (typeof value === 'boolean') return value ? 1 : 0
    if (Buffer.isBuffer(value)) return value
    return JSON.stringify(value)
  })
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.trunc(value)))
}
