import { createHash } from 'node:crypto'
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

/* ------------------------------------------------------------ 共享会话缓存 ---
 *
 * 为什么需要：HTTP 层过去每个请求都 openSession → work → close，一次"展开连接
 * 对象树"要串行发起 2~3 个请求（databases/schemas/tables），等于重复付 2~3 次
 * TCP+认证+探测的钱；数据库不可达时每个请求各吃满一次驱动超时（8s），UI 上就
 * 是"第一次加载要等很久"。这里按"连接参数+已解析密码哈希"缓存已打开的会话并
 * 跨请求复用，空闲由定时器回收。
 *
 * 关键设计：
 *  - key 含连接 id 与生效参数（含 database 覆盖），密码只进 sha256 哈希；
 *  - 打开中去重（同一 key 并发请求只建一次连）；
 *  - work 抛错即丢弃缓存会话，避免"死会话"被钉住（下次调用自动重建）；
 *  - 达梦等单连接方言（session.serial）用互斥队列串行化操作；
 *  - 空闲超 60s 由 sweep 关闭（定时器 unref，不阻止进程退出）；总量上限 8，LRU 淘汰。
 */

interface SharedEntry {
  recordId: string
  key: string
  session: DialectSession
  lastUsed: number
  /** serial 方言的操作队列尾部（非 serial 方言不使用） */
  tail: Promise<void>
}

const SHARED_IDLE_MS = 60_000
const SHARED_MAX = 8
const SWEEP_INTERVAL_MS = 30_000

const sharedEntries = new Map<string, SharedEntry>()
const sharedInflight = new Map<string, Promise<SharedEntry>>()
let sweepTimer: ReturnType<typeof setInterval> | null = null

function ensureSweep(): void {
  if (sweepTimer) return
  sweepTimer = setInterval(() => {
    const now = Date.now()
    for (const entry of [...sharedEntries.values()]) {
      if (now - entry.lastUsed > SHARED_IDLE_MS) dropShared(entry)
    }
    if (sharedEntries.size === 0 && sweepTimer) {
      clearInterval(sweepTimer)
      sweepTimer = null
    }
  }, SWEEP_INTERVAL_MS)
  sweepTimer.unref?.()
}

function sharedKeyOf(record: ConnectionRecord, resolvedPassword: string): string {
  const digest = createHash('sha256').update(resolvedPassword).digest('hex').slice(0, 16)
  const parts = [
    record.id,
    record.type,
    record.host ?? '',
    record.port ?? '',
    record.user ?? '',
    record.database ?? '',
    record.schema ?? '',
    record.ssl ? 1 : 0,
    record.file ?? '',
    record.authSource ?? '',
    record.dmCompat ?? '',
    record.dmNoEncrypt ? 1 : 0,
    JSON.stringify(record.options ?? {}),
  ]
  return `${parts.join('|')}#${digest}`
}

async function acquireShared(record: ConnectionRecord, runtime: RuntimeContext): Promise<SharedEntry> {
  const resolvedPassword = await resolvePassword(record, runtime.resolveCredential)
  const effective: ConnectionRecord = resolvedPassword === record.password
    ? record
    : { ...record, password: resolvedPassword }
  const key = sharedKeyOf(effective, resolvedPassword)

  const existing = sharedEntries.get(key)
  if (existing) {
    existing.lastUsed = Date.now()
    return existing
  }
  const inflight = sharedInflight.get(key)
  if (inflight) return inflight

  const opening = (async (): Promise<SharedEntry> => {
    const session = createDialectSession(effective)
    await session.open()
    const entry: SharedEntry = {
      recordId: effective.id,
      key,
      session,
      lastUsed: Date.now(),
      tail: Promise.resolve(),
    }
    sharedEntries.set(key, entry)
    ensureSweep()
    // 总量上限：按 lastUsed 淘汰最久未用的会话
    while (sharedEntries.size > SHARED_MAX) {
      let oldest: SharedEntry | undefined
      for (const candidate of sharedEntries.values()) {
        if (oldest === undefined || candidate.lastUsed < oldest.lastUsed) oldest = candidate
      }
      if (oldest) dropShared(oldest)
      else break
    }
    return entry
  })()
  sharedInflight.set(key, opening)
  try {
    return await opening
  } finally {
    sharedInflight.delete(key)
  }
}

function dropShared(entry: SharedEntry): void {
  if (sharedEntries.get(entry.key) === entry) sharedEntries.delete(entry.key)
  void entry.session.close().catch(() => undefined)
}

/** serial 方言（达梦）：同一物理连接上的操作必须排队执行。 */
function runExclusive<T>(entry: SharedEntry, fn: (session: DialectSession) => Promise<T>): Promise<T> {
  const result = entry.tail.then(() => fn(entry.session))
  entry.tail = result.then(() => undefined, () => undefined)
  return result
}

/**
 * 复用共享会话执行一次操作（不关闭会话）。
 * 会话按连接参数缓存复用；出错时丢弃缓存会话，下次调用重新建连。
 * 「测试连接」等需要验证真实连通性的场景请改用 withSession（独占新建）。
 */
export async function withSharedSession<T>(
  record: ConnectionRecord,
  runtime: RuntimeContext,
  work: (session: DialectSession) => Promise<T>,
): Promise<T> {
  const entry = await acquireShared(record, runtime)
  try {
    const result = entry.session.serial
      ? await runExclusive(entry, work)
      : await work(entry.session)
    entry.lastUsed = Date.now()
    return result
  } catch (reason) {
    // 出错即丢弃缓存会话：可能是连接被对端断开，避免坏会话被反复复用
    dropShared(entry)
    throw reason
  }
}

/** 连接被保存/删除后调用：关闭该连接（含 database 覆盖变体）的所有共享会话。 */
export function invalidateSharedSessions(recordId: string): void {
  for (const entry of [...sharedEntries.values()]) {
    if (entry.recordId === recordId) dropShared(entry)
  }
}

/** 插件卸载时调用：关闭全部共享会话并停掉 sweep 定时器。 */
export async function closeAllSharedSessions(): Promise<void> {
  const entries = [...sharedEntries.values()]
  sharedEntries.clear()
  if (sweepTimer) {
    clearInterval(sweepTimer)
    sweepTimer = null
  }
  await Promise.all(entries.map((entry) => entry.session.close().catch(() => undefined)))
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
  await withSharedSession(record, runtime, async (session) => {
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
