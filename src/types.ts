/** 支持的数据库类型。 */
export type DbType = 'postgresql' | 'mysql' | 'mongodb' | 'sqlite' | 'dameng'

/** 连接级/全局级 AI 路由配置（NL→SQL 时使用）。 */
export interface AiRouteConfig {
  /** harness 模型路由：provider 名（例如 deepseek），留空则自动发现 */
  provider?: string
  /** harness 模型路由：model 名（例如 deepseek-chat），与 provider 同时留空则自动发现 */
  model?: string
  /** 自定义 OpenAI 兼容端点（可选）。设置后优先走该端点 */
  baseUrl?: string
  /** 自定义端点 API Key（可选） */
  apiKey?: string
}

/** 一条数据库连接的完整记录（含机密字段，仅服务端保存）。 */
export interface ConnectionRecord {
  /** 稳定 id（短随机串） */
  id: string
  /** 显示名 */
  name: string
  type: DbType
  // --- 服务器型 ---
  host?: string
  port?: number
  user?: string
  /** 明文密码，或 env:<VAR> / cred:<NAME> 引用 */
  password?: string
  /** 目标数据库（mysql/mongodb/pg/dameng 可用） */
  database?: string
  /** 默认 schema / owner（pg、dameng） */
  schema?: string
  /** TLS */
  ssl?: boolean
  // --- SQLite ---
  /** sqlite 数据库文件绝对路径 */
  file?: string
  // --- MongoDB ---
  /** MongoDB 额外连接参数（host 段之后的 query 部分由服务端拼装） */
  authSource?: string
  // --- 通用 ---
  /** 驱动级额外选项（键值字符串） */
  options?: Record<string, string>
  /** 达梦兼容模式：oracle（默认）| mysql（LIMIT 语法等） */
  dmCompat?: 'oracle' | 'mysql'
  /** 达梦：关闭登录/消息加密（Node OpenSSL3 与旧 RC4/DES 不兼容时报 0308010C 时开启） */
  dmNoEncrypt?: boolean
  /** 连接级 AI 覆盖 */
  ai?: AiRouteConfig
  createdAt?: string
  updatedAt?: string
  lastTestedAt?: string
  lastError?: string
}

/** 返回给前端的连接视图：机密一律不出现。 */
export type PublicConnection = Omit<ConnectionRecord, 'password' | 'ai'> & {
  hasPassword: boolean
  ai?: {
    provider?: string
    model?: string
    baseUrl?: string
    hasKey: boolean
  }
}

export interface SchemaInfo {
  name: string
  kind: 'database' | 'schema' | 'owner'
}

export interface TableInfo {
  name: string
  kind: 'table' | 'view' | 'collection' | 'other'
}

export interface ColumnInfo {
  name: string
  type: string
  nullable?: boolean
  primary?: boolean
  defaultValue?: string | null
  comment?: string
}

export type QueryKind = 'select' | 'change' | 'other'

export interface QueryResult {
  /** 列名（select 结果） */
  columns: string[]
  /** 二维行数据（值均已 JSON 化） */
  rows: unknown[][]
  /** 实际行数 */
  rowCount: number
  /** DML 影响行数等（非 select） */
  affectedRows?: number
  /** 耗时 ms */
  durationMs: number
  /** 是否因上限截断 */
  truncated: boolean
  /** 数据浏览：符合条件的总行数（仅当 <= 请求行数时可精确给出；未给时表示“可能还有更多”） */
  total?: number
  kind: QueryKind
  /** 说明文字（例如 MongoDB 过滤器、无返回语句） */
  message?: string
}

export interface RunQueryOptions {
  sql: string
  params?: unknown[]
  limit?: number
  /** 请求方传入；服务端强制只读判断会以 readOnly 为准 */
  readOnly?: boolean
  /** 服务端硬性单次上限（默认来自配置 maxRows） */
  hardLimit: number
  /** 是否允许 DML/DDL（readOnly=true 时强制为不允许） */
  allowWrite: boolean
}

/** 单元格编辑：把某行某列更新为新值（用主键/定位条件 WHERE）。 */
export interface CellUpdateInput {
  table: string
  schema?: string
  column: string
  /** 新值（null 表示存 NULL） */
  value: unknown
  /** 定位条件：列名→值（必须非空，由调用方校验） */
  pk: Array<{ column: string; value: unknown }>
}

/** 浏览页的整表排序/过滤请求（由各关系型方言生成 WHERE/ORDER BY，作用于全表）。 */
export interface PreviewOptions {
  sort?: { column: string; dir: 'asc' | 'desc' } | null
  /** 列名 → 包含匹配（大小写不敏感）的过滤值 */
  filters?: Record<string, string>
}

/** 各方言需要实现的运行时接口。每次执行开一个新会话（简单可靠）。 */
export interface DialectSession {
  /** 打开底层连接/资源（幂等）。 */
  open(): Promise<void>
  /** 释放资源。 */
  close(): Promise<void>
  /** 数据库/模式列表（不支持的方言返回空数组）。 */
  listSchemas(): Promise<SchemaInfo[]>
  /** 服务器上的数据库列表（PG/MySQL 用于“切换数据库”浏览；不支持的方言返回 undefined）。 */
  listDatabases?(): Promise<string[]>
  /** 单格更新（PG/MySQL/SQLite/达梦支持；其余方言不实现，界面提示只读）。 */
  updateCell?(input: CellUpdateInput): Promise<{ affectedRows: number }>
  /** 表/视图/集合列表。schema 省略时使用连接默认范围。 */
  listTables(schema?: string): Promise<TableInfo[]>
  tableColumns(table: string, schema?: string): Promise<ColumnInfo[]>
  /** 预览表数据（从 offset 行起最多 limit 行；可带整表排序/过滤）。 */
  preview(table: string, schema: string | undefined, limit: number, offset: number, options?: PreviewOptions): Promise<QueryResult>
  /** 执行用户 SQL（含只读校验）。 */
  runQuery(options: RunQueryOptions): Promise<QueryResult>
  /** 方言是否支持独立 schema/owner 选择 */
  readonly schemaAware: boolean
}

/** 连接 id → 会话构造器上下文：运行期上下文里可能需要的服务句柄 */
export interface RuntimeContext {
  log(level: 'info' | 'warn' | 'error', message: string, ...args: unknown[]): void
  /** credentials 服务（可为空）：用于 cred:NAME 密码引用 */
  resolveCredential?: (name: string) => Promise<string | undefined>
}
