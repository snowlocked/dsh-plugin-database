import type { ConnectionRecord, DialectSession, DbType, QueryResult, RuntimeContext } from './types.ts'
import type { ConnectionStore } from './store.ts'
import { DbConsoleError, wrapError } from './errors.ts'
import { createPostgresSession } from './dialects/postgres.ts'
import { createMysqlSession } from './dialects/mysql.ts'
import { createSqliteSession } from './dialects/sqlite.ts'
import { createMongodbSession } from './dialects/mongodb.ts'
import { createDamengSession } from './dialects/dameng.ts'
import { resolvePassword } from './store.ts'

export interface DialectMeta {
  label: string
  defaultPort: number | null
  /** 是否支持 schema/owner 选择（界面显示下拉） */
  schemaAware: boolean
  /** 是否必须填写 database 字段 */
  needsDatabase: boolean
  /** 是否支持填写 database 字段 */
  supportsDatabase: boolean
  sampleHost: string
}

const DIALECT_META: Record<DbType, DialectMeta> = {
  postgresql: { label: 'PostgreSQL', defaultPort: 5432, schemaAware: true, needsDatabase: false, supportsDatabase: true, sampleHost: '127.0.0.1' },
  mysql: { label: 'MySQL', defaultPort: 3306, schemaAware: false, needsDatabase: true, supportsDatabase: true, sampleHost: '127.0.0.1' },
  mongodb: { label: 'MongoDB', defaultPort: 27017, schemaAware: false, needsDatabase: true, supportsDatabase: true, sampleHost: '127.0.0.1' },
  sqlite: { label: 'SQLite', defaultPort: null, schemaAware: false, needsDatabase: false, supportsDatabase: false, sampleHost: '' },
  dameng: { label: '达梦 DM', defaultPort: 5236, schemaAware: true, needsDatabase: false, supportsDatabase: false, sampleHost: '127.0.0.1' },
}

export function dialectMeta(type: DbType): DialectMeta {
  return DIALECT_META[type] ?? { label: type, defaultPort: null, schemaAware: false, needsDatabase: false, supportsDatabase: false, sampleHost: '' }
}

export const SUPPORTED_TYPES: DbType[] = ['postgresql', 'mysql', 'mongodb', 'sqlite', 'dameng']

export function isSupportedType(value: unknown): value is DbType {
  return typeof value === 'string' && (SUPPORTED_TYPES as string[]).includes(value)
}

function createDialectSession(record: ConnectionRecord): DialectSession {
  switch (record.type) {
    case 'postgresql': return createPostgresSession(record)
    case 'mysql': return createMysqlSession(record)
    case 'mongodb': return createMongodbSession(record)
    case 'sqlite': return createSqliteSession(record)
    case 'dameng': return createDamengSession(record)
    default:
      throw new DbConsoleError(`不支持的数据库类型：${String(record.type)}`, 'UNSUPPORTED_TYPE', 400)
  }
}

/** 打开一个会话（先解析密码引用，再交给对应方言）。调用方负责 close。 */
export async function openSession(record: ConnectionRecord, runtime: RuntimeContext): Promise<DialectSession> {
  const resolvedPassword = await resolvePassword(record, runtime.resolveCredential)
  const effective: ConnectionRecord = resolvedPassword === record.password
    ? record
    : { ...record, password: resolvedPassword }
  const session = createDialectSession(effective)
  await session.open()
  return session
}

export async function withSession<T>(
  record: ConnectionRecord,
  runtime: RuntimeContext,
  work: (session: DialectSession) => Promise<T>,
): Promise<T> {
  const session = await openSession(record, runtime)
  try {
    return await work(session)
  } finally {
    await session.close().catch(() => undefined)
  }
}

/** 连通性测试：打开会话并执行一次方言级探测。 */
export async function testConnection(record: ConnectionRecord, runtime: RuntimeContext): Promise<{
  ok: boolean
  latencyMs: number
  message: string
  detail?: string
}> {
  const started = Date.now()
  try {
    await withSession(record, runtime, async (session) => {
      // open() 内部已做探测；这里再取一次元数据以验证只读权限基本可用
      await session.listSchemas().catch(() => session.listTables(undefined).catch(() => undefined))
    })
    return { ok: true, latencyMs: Date.now() - started, message: '连接成功' }
  } catch (reason) {
    const error = wrapError(reason, '连接失败', 'TEST_CONNECT', 502)
    return {
      ok: false,
      latencyMs: Date.now() - started,
      message: error.message || '连接失败',
      detail: reason instanceof Error ? reason.message : String(reason),
    }
  }
}

export interface AiIntrospection {
  tableCount: number
  columnCount: number
  schemaText: string
}

/** 收集用于 NL→SQL 的表结构摘要文本（限制规模，防止溢出上下文）。 */
export async function introspectSchema(
  record: ConnectionRecord,
  runtime: RuntimeContext,
  options: { maxTables?: number; maxColumns?: number } = {},
): Promise<AiIntrospection> {
  const maxTables = Math.min(Math.max(1, options.maxTables ?? 120), 500)
  const maxColumns = Math.min(Math.max(1, options.maxColumns ?? 40), 300)
  const parts: string[] = []
  let tableCount = 0
  let columnCount = 0
  await withSession(record, runtime, async (session) => {
    const schema = record.schema || undefined
    const tables = await session.listTables(schema).catch(() => [] as { name: string; kind: string }[])
    if (tables.length === 0) return
    parts.push(`## ${session.schemaAware ? 'schema/owner' : '数据库'} 说明`)
    const limited = tables.slice(0, maxTables)
    for (const table of limited) {
      tableCount += 1
      const line = [`### 表 ${table.name} (${table.kind})`]
      const columns = await session.tableColumns(table.name, schema).catch(() => [])
      if (columns.length === 0) continue
      const colLines = columns.slice(0, maxColumns).map((column) => {
        columnCount += 1
        const flags = [
          column.primary ? 'PK' : '',
          column.nullable === false ? 'NOT NULL' : '',
        ].filter(Boolean).join(',')
        const def = column.defaultValue ? ` DEFAULT ${column.defaultValue}` : ''
        const comment = column.comment ? ` -- ${column.comment}` : ''
        return `- ${column.name} ${column.type}${flags ? ` [${flags}]` : ''}${def}${comment}`
      })
      line.push(colLines.join('\n'))
      parts.push(line.join('\n'))
    }
  })
  return { tableCount, columnCount, schemaText: parts.join('\n\n') }
}
