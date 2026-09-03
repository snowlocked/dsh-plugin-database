/* 与 server http.ts 返回结构对齐的类型 + 请求封装（浏览器端，不依赖任何库）。 */

export type DbType = 'postgresql' | 'mysql' | 'mongodb' | 'sqlite' | 'dameng'

export interface ConnectionView {
  id: string
  name: string
  type: DbType
  host?: string
  port?: number
  user?: string
  database?: string
  schema?: string
  ssl?: boolean
  file?: string
  authSource?: string
  dmCompat?: 'oracle' | 'mysql'
  dmNoEncrypt?: boolean
  options?: Record<string, string>
  hasPassword: boolean
  ai?: { provider?: string; model?: string; baseUrl?: string; hasKey: boolean }
  createdAt?: string
  updatedAt?: string
  lastTestedAt?: string
  lastError?: string
}

export interface ConnectionInput {
  id?: string
  name: string
  type: DbType
  host?: string
  port?: number
  user?: string
  password?: string
  database?: string
  schema?: string
  ssl?: boolean
  file?: string
  authSource?: string
  dmCompat?: 'oracle' | 'mysql'
  dmNoEncrypt?: boolean
  options?: Record<string, string>
  ai?: { provider?: string; model?: string; baseUrl?: string; apiKey?: string }
}

export interface SchemaEntry { name: string; kind: string }
export interface TableEntry { name: string; kind: string }
export interface ColumnEntry {
  name: string
  type: string
  nullable: boolean
  primary: boolean
  defaultValue?: string | null
  comment?: string
}

export interface QueryResult {
  columns: string[]
  rows: unknown[][]
  rowCount: number
  affectedRows?: number
  durationMs: number
  truncated: boolean
  /** 数据浏览：符合条件的总行数（未给时表示可能还有更多） */
  total?: number
  kind: 'select' | 'change'
  message?: string
}

export interface TestResult { ok: boolean; latencyMs: number; message: string; detail?: string }
export interface GenerateResult {
  sql: string
  engine: 'custom' | 'harness'
  provider?: string
  model?: string
  note?: string
}
export interface AiRunResult extends GenerateResult { result: QueryResult }
/** DSH 可用模型（复用 DSH 自身配置，不重复填 provider/密钥） */
export interface AiModelOption {
  /** 合并键：provider/model 都匹配同一模型时使用；单值匹配该 provider 的默认模型 */
  key: string
  provider: string
  model: string
  label?: string
}
export interface AiModelsResult {
  ok: boolean
  providers: Array<{ provider: string; label?: string; models: Array<{ id: string; label?: string }> }>
  message?: string
}
export interface StateInfo {
  ok: boolean
  name: string
  version: string
  maxRows: number
  dataDir: string
  storeFile: string
  supportedTypes: DbType[]
}

export const TYPE_LABELS: Record<DbType, string> = {
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  mongodb: 'MongoDB',
  sqlite: 'SQLite',
  dameng: '达梦 DM',
}

export const PREFIX = '/api/dsh-database-console'

export class ApiError extends Error {
  status: number
  code?: string
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${PREFIX}${path}`, init)
  } catch (reason) {
    throw new ApiError(`网络请求失败：${reason instanceof Error ? reason.message : String(reason)}`, 0)
  }
  let payload: unknown = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }
  if (!response.ok) {
    const record = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
    throw new ApiError(String(record.error ?? `HTTP ${response.status}`), response.status, String(record.code ?? ''))
  }
  return payload as T
}

function jsonBody(data: unknown): RequestInit {
  return {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  }
}

/**
 * DSH 真实 webServer 只注册 POST 路由（GET→404、DELETE→405，已 e2e 实测），
 * 因此所有接口统一走 POST + JSON body。
 */
function post<T>(path: string, data?: unknown): Promise<T> {
  return apiJson<T>(path, jsonBody(data ?? {}))
}

export const dbApi = {
  state: () => post<StateInfo>('/state'),
  connections: () => post<{ connections: ConnectionView[] }>('/connections/list'),
  meta: (id: string) => post<{ id: string; name: string; type: DbType; label: string; schemaAware: boolean; lastError?: string }>('/connection/meta', { id }),
  save: (input: ConnectionInput) => post<{ ok: boolean; connection: ConnectionView }>('/connections/save', input),
  remove: (id: string) => post<{ ok: boolean }>('/connection/remove', { id }),
  test: (input: ConnectionInput) => post<TestResult>('/connections/test', input),
  databases: (id: string) => post<{ databases: string[]; supported: boolean }>('/connection/databases', { id }),
  schemas: (id: string, database?: string) => post<{ schemas: SchemaEntry[] }>('/connection/schemas', { id, ...(database ? { database } : {}) }),
  tables: (id: string, schema?: string, database?: string) =>
    post<{ tables: TableEntry[] }>('/connection/tables', { id, ...(schema ? { schema } : {}), ...(database ? { database } : {}) }),
  columns: (id: string, table: string, schema?: string, database?: string) =>
    post<{ columns: ColumnEntry[] }>('/connection/columns', { id, table, ...(schema ? { schema } : {}), ...(database ? { database } : {}) }),
  rows: (id: string, table: string, schema: string | undefined, limit: number, offset: number, database?: string, preview?: { sort?: { column: string; dir: 'asc' | 'desc' } | null; filters?: Record<string, string> } | null) =>
    post<QueryResult>('/connection/rows', {
      id,
      table,
      ...(schema ? { schema } : {}),
      ...(database ? { database } : {}),
      limit,
      offset,
      ...(preview?.sort ? { sort: preview.sort } : {}),
      ...(preview?.filters && Object.keys(preview.filters).length > 0 ? { filters: preview.filters } : {}),
    }),
  cellUpdate: (options: { id: string; table: string; schema?: string; database?: string; column: string; pk: Array<{ column: string; value: unknown }>; value: unknown; isNull: boolean }) =>
    post<{ ok: boolean; affectedRows: number }>('/connection/cell/update', {
      id: options.id,
      table: options.table,
      ...(options.schema ? { schema: options.schema } : {}),
      ...(options.database ? { database: options.database } : {}),
      column: options.column,
      pk: options.pk,
      value: options.value,
      isNull: options.isNull,
    }),
  query: (id: string, sql: string, readOnly: boolean, limit?: number, database?: string) =>
    post<QueryResult>('/query', { id, sql, readOnly, ...(database ? { database } : {}), ...(limit ? { limit } : {}) }),
  aiModels: () => post<AiModelsResult>('/ai/models'),
  aiGenerate: (id: string, question: string, selection?: { provider?: string; model?: string }, database?: string) =>
    post<GenerateResult>('/ai/generate', { id, question, ...(database ? { database } : {}), ...(selection?.provider ? { provider: selection.provider } : {}), ...(selection?.model ? { model: selection.model } : {}) }),
  aiRun: (id: string, question: string, selection?: { provider?: string; model?: string }, limit?: number, database?: string) =>
    post<AiRunResult>('/ai/run', { id, question, ...(database ? { database } : {}), ...(selection?.provider ? { provider: selection.provider } : {}), ...(selection?.model ? { model: selection.model } : {}), ...(limit ? { limit } : {}) }),
}

export function isSchemaAware(type: DbType): boolean {
  return type === 'postgresql' || type === 'dameng'
}

export function defaultPort(type: DbType): number | null {
  switch (type) {
    case 'postgresql': return 5432
    case 'mysql': return 3306
    case 'mongodb': return 27017
    case 'dameng': return 5236
    default: return null
  }
}

/** 仅前端展示用的格式化。 */
export function cellText(value: unknown): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'object') {
    try { return JSON.stringify(value) } catch { return String(value) }
  }
  return String(value)
}
