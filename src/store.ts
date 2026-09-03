import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync, chmodSync } from 'node:fs'
import { join } from 'node:path'
import type { ConnectionRecord, PublicConnection } from './types.ts'
import { DbConsoleError } from './errors.ts'

export interface ConnectionStore {
  list(): PublicConnection[]
  get(id: string): ConnectionRecord | undefined
  save(input: Partial<ConnectionRecord> & { name: string; type: ConnectionRecord['type'] }): ConnectionRecord
  remove(id: string): boolean
  /** 记录一次连通性测试结果（不保存机密以外的字段变更）。 */
  noteTestResult(id: string, ok: boolean, errorMessage?: string): void
  readonly file: string
}

export const DEFAULT_DATA_DIR = 'dsh-database'

const MAX_NAME = 120
const CONNECTION_ID_RE = /^[A-Za-z0-9_-]{6,64}$/u

export function isValidConnectionId(id: string): boolean {
  return CONNECTION_ID_RE.test(id)
}

function sanitize(record: ConnectionRecord): PublicConnection {
  const { password: _password, ai, ...rest } = record
  return {
    ...rest,
    hasPassword: typeof record.password === 'string' && record.password.length > 0,
    ...(ai
      ? {
          ai: {
            provider: ai.provider,
            model: ai.model,
            baseUrl: ai.baseUrl,
            hasKey: typeof ai.apiKey === 'string' && ai.apiKey.length > 0,
          },
        }
      : {}),
  }
}

function newId(): string {
  return `db_${randomBytes(5).toString('hex')}`
}

function normalizeRecord(input: Partial<ConnectionRecord> & { name: string; type: ConnectionRecord['type'] }): ConnectionRecord {
  const name = input.name?.trim()
  if (!name) throw new DbConsoleError('连接名称不能为空', 'INVALID_NAME')
  if (name.length > MAX_NAME) throw new DbConsoleError(`连接名称过长（最多 ${MAX_NAME} 字符）`, 'INVALID_NAME')
  const type = input.type
  const now = new Date().toISOString()
  return {
    id: input.id && isValidConnectionId(input.id) ? input.id : newId(),
    name,
    type,
    host: input.host?.trim() || undefined,
    port: typeof input.port === 'number' && input.port > 0 ? Math.trunc(input.port) : undefined,
    user: input.user?.trim() || undefined,
    password: typeof input.password === 'string' ? input.password : undefined,
    database: input.database?.trim() || undefined,
    schema: input.schema?.trim() || undefined,
    ssl: input.ssl === true,
    file: input.file?.trim() || undefined,
    authSource: input.authSource?.trim() || undefined,
    options: input.options && Object.keys(input.options).length > 0 ? { ...input.options } : undefined,
    dmCompat: input.dmCompat === 'mysql' ? 'mysql' : input.dmCompat === 'oracle' ? 'oracle' : undefined,
    dmNoEncrypt: input.dmNoEncrypt === true,
    ai: input.ai && (input.ai.provider || input.ai.model || input.ai.baseUrl || input.ai.apiKey)
      ? { ...input.ai }
      : undefined,
    createdAt: input.createdAt ?? now,
    updatedAt: now,
    ...(input.lastTestedAt ? { lastTestedAt: input.lastTestedAt } : {}),
    ...(input.lastError ? { lastError: input.lastError } : {}),
  }
}

function validateShape(record: ConnectionRecord): void {
  const common = (field: string, value: unknown): void => {
    if (value === undefined) return
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
      throw new DbConsoleError(`字段 ${field} 类型不正确`, 'INVALID_CONNECTION')
    }
  }
  for (const key of ['name', 'host', 'user', 'password', 'database', 'schema', 'file', 'authSource'] as const) {
    common(key, record[key])
  }
  if (record.type === 'sqlite' && !record.file) {
    throw new DbConsoleError('SQLite 连接必须填写数据库文件路径', 'INVALID_CONNECTION')
  }
  if (record.type !== 'sqlite' && !record.host) {
    throw new DbConsoleError(`${record.type} 连接必须填写主机地址`, 'INVALID_CONNECTION')
  }
}

export function createConnectionStore(dataDir: string, log?: (message: string) => void): ConnectionStore {
  const dir = dataDir
  const file = join(dir, 'connections.json')

  const ensureDir = (): void => {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  }

  /**
   * 每次都从磁盘读取（不做进程内缓存）：
   * 1) 编辑/删除后其它实例或页面刷新能立刻看到最新结果；
   * 2) 多个 DSH web 实例共存时不会出现“删掉的又复活 / 出现两条同名”的假象。
   * 文件很小（连接数通常个位数），直读成本可忽略。
   */
  const load = (): ConnectionRecord[] => {
    ensureDir()
    if (!existsSync(file)) return []
    try {
      const raw = JSON.parse(readFileSync(file, 'utf8')) as {
        version?: number
        connections?: ConnectionRecord[]
      }
      return Array.isArray(raw.connections) ? raw.connections : []
    } catch (error) {
      log?.(`[dsh-database-console] 连接文件读取失败：${error instanceof Error ? error.message : String(error)}`)
      return []
    }
  }

  const persist = (records: ConnectionRecord[]): void => {
    ensureDir()
    const payload = JSON.stringify({ version: 1, connections: records }, null, 2)
    const tmp = `${file}.tmp-${process.pid}`
    writeFileSync(tmp, payload, 'utf8')
    try {
      chmodSync(tmp, 0o600)
    } catch {
      // Windows 下 chmod 可能无意义，忽略
    }
    renameSync(tmp, file)
  }

  return {
    file,
    list() {
      return load()
        .map((record) => sanitize(record))
        .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
    },
    get(id) {
      return load().find((record) => record.id === id)
    },
    save(input) {
      const records = load()
      const current = input.id ? records.find((record) => record.id === input.id) : undefined
      // 同名同目标保护：编辑/新建都不允许出现两条指向同一数据库的重复连接
      // （不同主机/不同文件、仅同名是允许的）
      const sameTarget = (record: ConnectionRecord): boolean => {
        if (record.name.trim() !== input.name.trim() || record.type !== input.type) return false
        if (record.type === 'sqlite') {
          return (record.file ?? '') === (input.file?.trim() ?? '')
        }
        const sameHost = (record.host ?? '') === (input.host?.trim() ?? '')
        const sameDb = (record.database ?? '') === (input.database?.trim() ?? '')
        return sameHost && sameDb
      }
      const duplicate = records.find((record) => record.id !== (current?.id ?? input.id) && sameTarget(record))
      if (duplicate) {
        throw new DbConsoleError(
          `已存在指向同一目标的连接「${duplicate.name}」(${duplicate.id})。如需修改请点列表中的「编辑」，不要重复新建。`,
          'DUPLICATE_NAME',
          400,
        )
      }
      // 机密保留语义：未重新填写密码 / AI Key 时保留原值，避免编辑保存把已存密码清空
      const merged: Partial<ConnectionRecord> & { name: string; type: ConnectionRecord['type'] } = {
        ...current,
        ...input,
      }
      if (typeof input.password !== 'string' || input.password.trim() === '') {
        merged.password = current?.password
      } else {
        merged.password = input.password
      }
      // AI 不再按连接配置（复用 DSH 自身的模型，界面按需选模型）；
      // 未提交 ai 即清掉历史遗留的连接级 AI 配置。
      merged.ai = input.ai
      merged.id = current?.id ?? input.id
      const record = normalizeRecord(merged)
      validateShape(record)
      const existingIndex = records.findIndex((item) => item.id === record.id)
      if (existingIndex >= 0) records[existingIndex] = record
      else records.push(record)
      persist(records)
      log?.(`[dsh-database-console] 已保存连接「${record.name}」(${record.id})`)
      return record
    },
    remove(id) {
      if (!isValidConnectionId(id)) return false
      const records = load()
      const index = records.findIndex((record) => record.id === id)
      if (index < 0) return false
      records.splice(index, 1)
      persist(records)
      log?.(`[dsh-database-console] 已删除连接 ${id}`)
      return true
    },
    noteTestResult(id, ok, errorMessage) {
      const records = load()
      const record = records.find((item) => item.id === id)
      if (!record) return
      record.lastTestedAt = new Date().toISOString()
      if (ok) delete record.lastError
      else record.lastError = errorMessage
      persist(records)
    },
  }
}

/** 解析密码引用：明文 | env:VAR | cred:NAME。 */
export async function resolvePassword(
  record: ConnectionRecord,
  resolveCredential?: (name: string) => Promise<string | undefined>,
): Promise<string> {
  const password = record.password ?? ''
  if (!password) return ''
  if (password.startsWith('env:')) {
    const name = password.slice(4).trim()
    const value = process.env[name]
    if (value === undefined) {
      throw new DbConsoleError(`连接「${record.name}」的密码引用了未设置的环境变量 ${name}`, 'ENV_MISSING', 400)
    }
    return value
  }
  if (password.startsWith('cred:')) {
    const name = password.slice(5).trim()
    if (!resolveCredential) {
      throw new DbConsoleError(`连接「${record.name}」的密码引用 cred:${name}，但当前 DSH 未提供凭据服务`, 'CRED_UNAVAILABLE', 400)
    }
    const value = await resolveCredential(name)
    if (value === undefined) {
      throw new DbConsoleError(`连接「${record.name}」的密码引用 cred:${name}，但未找到对应凭据`, 'CRED_MISSING', 400)
    }
    return value
  }
  return password
}

/** 数据目录默认值：<DSH_HOME>/dsh-database（未设置 DSH_HOME 时取 ~/.dsh/dsh-database）。 */
export function defaultDataDir(): string {
  const home = process.env.DSH_HOME && process.env.DSH_HOME.length > 0 ? process.env.DSH_HOME : null
  if (home) return join(home, DEFAULT_DATA_DIR)
  const osHome = process.env.HOME || process.env.USERPROFILE || '.'
  return join(osHome, '.dsh', DEFAULT_DATA_DIR)
}

