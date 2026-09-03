import type { ConnectionRecord, DbType, QueryResult } from './types.ts'
import type { ConnectionStore } from './store.ts'
import { isValidConnectionId } from './store.ts'
import { DbConsoleError } from './errors.ts'
import { dialectMeta, isSupportedType, testConnection, withSession } from './manager.ts'
import { generateSql } from './ai.ts'
import { normalizeSchema } from './sqlutil.ts'
import type { AiSettings } from './ai.ts'

/** webServer.register 的 handler 收到的 request（Node IncomingMessage 子集）。 */
export interface HttpRequest {
  method?: string
  url?: string
  [Symbol.asyncIterator](): AsyncIterator<Buffer>
}

/** webServer.register 的 handler 收到的 response。 */
export interface HttpResponse {
  statusCode: number
  setHeader(name: string, value: string): void
  end(body?: string): void
  writeHead?(status: number, headers?: Record<string, string>): void
}

export interface HttpRoute {
  kind: 'exact' | 'prefix'
  path: string
  /** 仅用于测试/调试标识，实际分发以 handler 内 method 校验为准 */
  method?: string
  handler: (request: HttpRequest, response: HttpResponse) => void | Promise<void>
}

export interface ApiDeps {
  store: ConnectionStore
  getCredentials?: (name: string) => Promise<string | undefined>
  log(level: 'info' | 'warn' | 'error', message: string): void
  maxRows: number
  aiFallback: AiSettings
  /** 取当前 cordis ctx 上的 llm 服务（可为空） */
  getLlm(): unknown
}

const PREFIX = '/api/dsh-database-console'

const MAX_BODY_BYTES = 2 * 1024 * 1024

function sendJson(response: HttpResponse, status: number, body: unknown): void {
  response.statusCode = status
  response.setHeader('content-type', 'application/json; charset=utf-8')
  response.setHeader('cache-control', 'no-store')
  response.end(JSON.stringify(body))
}

async function readJsonBody(request: HttpRequest): Promise<unknown | undefined> {
  const chunks: Buffer[] = []
  let size = 0
  try {
    for await (const chunk of request) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      size += buffer.length
      if (size > MAX_BODY_BYTES) return undefined
      chunks.push(buffer)
    }
  } catch {
    return undefined
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return undefined
  }
}

function queryParam(request: HttpRequest, key: string): string | undefined {
  const url = request.url ?? ''
  const index = url.indexOf('?')
  if (index < 0) return undefined
  return new URLSearchParams(url.slice(index + 1)).get(key) ?? undefined
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function pickString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string') return value
  }
  return undefined
}

/** 从 body/query 解析连接输入。 */
function connectionFromBody(record: Record<string, unknown>): Partial<ConnectionRecord> & { name: string; type: DbType } {
  const name = pickString(record, ['name']) ?? ''
  const typeValue = pickString(record, ['type'])
  if (!name || !typeValue || !isSupportedType(typeValue)) {
    throw new DbConsoleError('缺少 name 或 type 字段（支持：postgresql/mysql/mongodb/sqlite/dameng）', 'BAD_INPUT', 400)
  }
  const port = typeof record.port === 'number' ? record.port : record.port !== undefined && record.port !== null ? Number(record.port) : undefined
  const options: Record<string, string> | undefined =
    record.options && typeof record.options === 'object'
      ? Object.fromEntries(Object.entries(record.options as Record<string, unknown>).filter(([, v]) => typeof v === 'string')) as Record<string, string>
      : undefined
  const ai = record.ai && typeof record.ai === 'object' ? toRecord(record.ai) : undefined
  return {
    id: pickString(record, ['id']),
    name,
    type: typeValue as DbType,
    host: pickString(record, ['host']),
    port: Number.isFinite(port as number) ? Math.trunc(port as number) : undefined,
    user: pickString(record, ['user', 'username']),
    password: pickString(record, ['password']),
    database: pickString(record, ['database', 'db']),
    schema: pickString(record, ['schema']),
    ssl: record.ssl === true,
    file: pickString(record, ['file', 'filePath']),
    authSource: pickString(record, ['authSource']),
    dmCompat: record.dmCompat === 'mysql' ? 'mysql' : record.dmCompat === 'oracle' ? 'oracle' : undefined,
    dmNoEncrypt: record.dmNoEncrypt === true,
    options,
    ai: ai
      ? {
          provider: pickString(ai, ['provider']),
          model: pickString(ai, ['model']),
          baseUrl: pickString(ai, ['baseUrl']),
          apiKey: pickString(ai, ['apiKey']),
        }
      : undefined,
  }
}

function requireId(value: unknown): string {
  const id = typeof value === 'string' ? value : ''
  if (!isValidConnectionId(id)) throw new DbConsoleError('缺少或非法的 connection id', 'BAD_ID', 400)
  return id
}

function connectionOf(deps: ApiDeps, id: string): ConnectionRecord {
  const record = deps.store.get(id)
  if (!record) throw new DbConsoleError(`连接不存在：${id}`, 'NOT_FOUND', 404)
  return record
}

function requireTable(value: unknown): string {
  const table = typeof value === 'string' ? value.trim() : ''
  if (!table || table.length > 200) throw new DbConsoleError('缺少或非法的表名', 'BAD_TABLE', 400)
  return table
}

function runtimeOf(deps: ApiDeps) {
  return {
    log: deps.log,
    resolveCredential: deps.getCredentials,
  }
}

function clampLimit(raw: number | undefined, fallback: number, hard: number): number {
  if (raw === undefined || !Number.isFinite(raw)) return Math.min(fallback, hard)
  return Math.min(Math.max(1, Math.trunc(raw)), hard)
}

export function buildApiRoutes(deps: ApiDeps): HttpRoute[] {
  const runtime = runtimeOf(deps)
  const hard = Math.min(Math.max(1, deps.maxRows), 10_000)
  const defaultPreview = Math.min(hard, 500)

  const routes: HttpRoute[] = []
  const add = (method: string, path: string, handler: HttpRoute['handler']): void => {
    routes.push({
      kind: 'exact',
      path,
      method,
      handler: async (request, response) => {
        if (request.method && request.method.toUpperCase() !== method) {
          sendJson(response, 405, { error: 'Method not allowed' })
          return
        }
        try {
          await handler(request, response)
        } catch (reason) {
          const error = reason instanceof DbConsoleError
            ? reason
            : new DbConsoleError(reason instanceof Error ? reason.message : String(reason), 'ERR_INTERNAL', 500)
          if (error.status >= 500) deps.log('error', `[api] ${method} ${path} 失败：${error.message}`)
          sendJson(response, error.status, { error: error.message, code: error.code })
        }
      },
    })
  }

  const idOf = (body: Record<string, unknown>): string => requireId(pickString(body, ['id']))
  const tableOf = (body: Record<string, unknown>): string => requireTable(pickString(body, ['table']))
  const optSchema = (body: Record<string, unknown>): string | undefined => normalizeSchema(pickString(body, ['schema']))
  const num = (value: unknown, fallback: number): number => {
    const parsed = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  /** 界面“切换数据库”浏览：可选的 database 覆盖（空=连接保存的默认库） */
  const withDatabase = (record: ConnectionRecord, body: Record<string, unknown>): ConnectionRecord => {
    const db = typeof body.database === 'string' && body.database.trim() !== '' ? body.database.trim() : undefined
    return db ? { ...record, database: db } : record
  }

  // 服务器上的数据库列表（PG/MySQL 切换数据库浏览；其它类型返回 supported:false）
  add('POST', `${PREFIX}/connection/databases`, async (request, response) => {
    const body = toRecord(await readJsonBody(request))
    const record = connectionOf(deps, idOf(body))
    let databases: string[] = []
    await withSession(record, runtime, async (session) => {
      if (typeof session.listDatabases === 'function') databases = await session.listDatabases()
    })
    sendJson(response, 200, { databases, supported: databases.length > 0 })
  })

  // 连接列表（脱敏）
  add('POST', `${PREFIX}/connections/list`, (_request, response) => {
    sendJson(response, 200, { connections: deps.store.list() })
  })

  // 连接元信息
  add('POST', `${PREFIX}/connection/meta`, async (request, response) => {
    const body = toRecord(await readJsonBody(request))
    const id = idOf(body)
    const record = connectionOf(deps, id)
    const meta = dialectMeta(record.type)
    sendJson(response, 200, {
      id: record.id,
      name: record.name,
      type: record.type,
      label: meta.label,
      schemaAware: meta.schemaAware,
      lastError: record.lastError,
      lastTestedAt: record.lastTestedAt,
    })
  })

  // 单个连接（脱敏，便于编辑回填）
  add('POST', `${PREFIX}/connection`, async (request, response) => {
    const body = toRecord(await readJsonBody(request))
    const id = idOf(body)
    const record = connectionOf(deps, id)
    const view = deps.store.list().find((item) => item.id === id) ?? record
    sendJson(response, 200, { connection: view })
  })

  // 保存（新建或更新）
  add('POST', `${PREFIX}/connections/save`, async (request, response) => {
    const body = toRecord(await readJsonBody(request))
    const input = connectionFromBody(body)
    const saved = deps.store.save(input)
    const view = deps.store.list().find((item) => item.id === saved.id) ?? saved
    sendJson(response, 200, { connection: view, ok: true })
  })

  // 测试连接（不落盘；带 id 时复用已保存的连接参数与密码，避免每次重输）
  add('POST', `${PREFIX}/connections/test`, async (request, response) => {
    const body = toRecord(await readJsonBody(request))
    const input = connectionFromBody(body)
    const stored = input.id ? deps.store.get(input.id) : undefined
    const effective: ConnectionRecord = stored
      ? {
          ...stored,
          ...input,
          // 表单未重新填密码 → 用已保存的密码测试
          password: typeof input.password === 'string' && input.password.trim() !== ''
            ? input.password
            : stored.password,
          ai: input.ai ?? stored.ai,
        }
      : (input as unknown as ConnectionRecord)
    const result = await testConnection(effective, runtime)
    if (result.ok && input.id) deps.store.noteTestResult(input.id, true)
    if (!result.ok && input.id) deps.store.noteTestResult(input.id, false, result.message)
    sendJson(response, 200, { ...result })
  })

  // 删除连接（DSH 真实 webServer 只支持 POST；DELETE/GET 会得到 405/404）
  add('POST', `${PREFIX}/connection/remove`, async (request, response) => {
    const body = toRecord(await readJsonBody(request))
    const id = requireId(pickString(body, ['id']) ?? queryParam(request, 'id'))
    const removed = deps.store.remove(id)
    sendJson(response, 200, { ok: removed })
  })

  // schemas（数据库/owner 列表）
  add('POST', `${PREFIX}/connection/schemas`, async (request, response) => {
    const body = toRecord(await readJsonBody(request))
    const record = withDatabase(connectionOf(deps, idOf(body)), body)
    const schemas = await withSession(record, runtime, (session) => session.listSchemas())
    sendJson(response, 200, { schemas })
  })

  // 表列表
  add('POST', `${PREFIX}/connection/tables`, async (request, response) => {
    const body = toRecord(await readJsonBody(request))
    const record = withDatabase(connectionOf(deps, idOf(body)), body)
    const tables = await withSession(record, runtime, (session) => session.listTables(optSchema(body)))
    sendJson(response, 200, { tables })
  })

  // 列结构
  add('POST', `${PREFIX}/connection/columns`, async (request, response) => {
    const body = toRecord(await readJsonBody(request))
    const record = withDatabase(connectionOf(deps, idOf(body)), body)
    const columns = await withSession(record, runtime, (session) => session.tableColumns(tableOf(body), optSchema(body)))
    sendJson(response, 200, { columns })
  })

  // 数据预览（分页；可带整表排序/过滤）
  add('POST', `${PREFIX}/connection/rows`, async (request, response) => {
    const body = toRecord(await readJsonBody(request))
    const record = withDatabase(connectionOf(deps, idOf(body)), body)
    const limit = clampLimit(num(body.limit, defaultPreview), 1, hard)
    const offset = Math.max(0, Math.trunc(num(body.offset, 0)) || 0)
    let sort: { column: string; dir: 'asc' | 'desc' } | undefined
    const rawSort = body.sort
    if (rawSort && typeof rawSort === 'object' && !Array.isArray(rawSort)) {
      const column = pickString(toRecord(rawSort), ['column'])
      const dir = pickString(toRecord(rawSort), ['dir']) === 'desc' ? 'desc' : 'asc'
      if (column && column.length <= 128) sort = { column, dir }
    }
    const filters: Record<string, string> = {}
    if (body.filters && typeof body.filters === 'object' && !Array.isArray(body.filters)) {
      let count = 0
      for (const [name, raw] of Object.entries(toRecord(body.filters))) {
        if (name.length > 128 || count >= 16) continue
        filters[name] = String(raw ?? '').slice(0, 200)
        count += 1
      }
    }
    const options = sort || Object.keys(filters).length > 0
      ? { sort: sort ?? null, filters }
      : undefined
    const result = await withSession(record, runtime, (session) =>
      session.preview(tableOf(body), optSchema(body), limit, offset, options))
    sendJson(response, 200, result)
  })

  // 单元格编辑（数据浏览内直接 UPDATE 单格；需要主键定位行）
  add('POST', `${PREFIX}/connection/cell/update`, async (request, response) => {
    const body = toRecord(await readJsonBody(request))
    const record = withDatabase(connectionOf(deps, idOf(body)), body)
    const column = pickString(body, ['column'])
    const table = requireTable(pickString(body, ['table']))
    if (!column) throw new DbConsoleError('缺少要更新的列名', 'CELL_INPUT', 400)
    const pkRaw = Array.isArray(body.pk) ? body.pk : []
    const pk = pkRaw
      .map((entry): { column: string; value: unknown } | null => {
        const obj = toRecord(entry) as Record<string, unknown>
        const name = pickString(obj, ['column'])
        return name ? { column: name, value: obj.value ?? null } : null
      })
      .filter((entry): entry is { column: string; value: unknown } => entry !== null)
      .slice(0, 8)
    if (pk.length === 0) throw new DbConsoleError('该行缺少主键定位条件，无法安全编辑（请确认表有主键）', 'CELL_NO_PK', 400)
    const value = body.isNull === true ? null : body.value
    let affectedRows = 0
    await withSession(record, runtime, async (session) => {
      if (typeof session.updateCell !== 'function') {
        throw new DbConsoleError('当前数据库类型暂不支持单元格编辑（仅 PostgreSQL/MySQL/SQLite/达梦）', 'CELL_EDIT_UNSUPPORTED', 400)
      }
      const result = await session.updateCell({ table, schema: optSchema(body), column, value, pk })
      affectedRows = result.affectedRows
    })
    sendJson(response, 200, { ok: true, affectedRows })
  })

  // 执行 SQL
  add('POST', `${PREFIX}/query`, async (request, response) => {
    const body = toRecord(await readJsonBody(request))
    const id = requireId(body.id)
    const record = withDatabase(connectionOf(deps, id), body)
    const sql = typeof body.sql === 'string' ? body.sql.trim() : ''
    if (!sql) throw new DbConsoleError('SQL 为空', 'EMPTY_SQL', 400)
    const params = Array.isArray(body.params) ? body.params : undefined
    const readOnly = body.readOnly !== false
    const limit = clampLimit(typeof body.limit === 'number' ? body.limit : 200, 1, hard)
    const result = await withSession(record, runtime, (session) =>
      session.runQuery({ sql, params, readOnly, allowWrite: !readOnly, hardLimit: limit }))
    sendJson(response, 200, result)
  })

  // 可用模型列表（复用 DSH 自身配置的 provider/model，供界面“按需选模型”）
  add('POST', `${PREFIX}/ai/models`, async (_request, response) => {
    const llm = deps.getLlm() as { listProviders?(): unknown[] | Promise<unknown[]>; listModels?(provider: string): unknown[] | Promise<unknown[]>; stream?(): unknown } | undefined
    const providers: Array<{ provider: string; label?: string; models: Array<{ id: string; label?: string }> }> = []
    if (llm && typeof llm.listProviders === 'function') {
      try {
        const rawProviders = (await llm.listProviders()) ?? []
        for (const entry of rawProviders) {
          const record = entry as Record<string, unknown>
          const provider = String(record.id ?? record.name ?? record.provider ?? '')
          if (!provider) continue
          const models: Array<{ id: string; label?: string }> = []
          if (typeof llm.listModels === 'function') {
            try {
              for (const model of ((await llm.listModels(provider)) ?? []) as Array<Record<string, unknown>>) {
                const id = String(model.id ?? model.name ?? '')
                if (id) models.push({ id, ...(typeof model.label === 'string' ? { label: model.label } : {}) })
              }
            } catch { /* 单个 provider 暂不可枚举也允许 */ }
          }
          providers.push({
            provider,
            ...(typeof record.label === 'string' ? { label: record.label } : {}),
            models,
          })
        }
      } catch (reason) {
        deps.log('warn', `[ai/models] 枚举模型失败：${reason instanceof Error ? reason.message : String(reason)}`)
      }
    }
    sendJson(response, 200, {
      ok: providers.length > 0,
      providers,
      ...(providers.length === 0 ? { message: '当前 DSH 未提供可用的模型 provider，请在 DSH 的 AI/模型设置中完成配置' } : {}),
    })
  })

  // AI：自然语言 → SQL（不执行）
  add('POST', `${PREFIX}/ai/generate`, async (request, response) => {
    const body = toRecord(await readJsonBody(request))
    const id = requireId(body.id)
    const record = withDatabase(connectionOf(deps, id), body)
    const question = typeof body.question === 'string' ? body.question : ''
    if (!question) throw new DbConsoleError('请输入要查询的问题', 'AI_INPUT', 400)
    const result = await generateSql({
      question,
      connection: record,
      runtime,
      fallback: deps.aiFallback,
      connectionAi: record.ai,
      provider: typeof body.provider === 'string' && body.provider.trim() ? body.provider.trim() : undefined,
      model: typeof body.model === 'string' && body.model.trim() ? body.model.trim() : undefined,
      llm: deps.getLlm() as never,
    })
    sendJson(response, 200, { ...result })
  })

  // AI：自然语言直接查数据（生成并只读执行）
  add('POST', `${PREFIX}/ai/run`, async (request, response) => {
    const body = toRecord(await readJsonBody(request))
    const id = requireId(body.id)
    const record = withDatabase(connectionOf(deps, id), body)
    const question = typeof body.question === 'string' ? body.question : ''
    if (!question) throw new DbConsoleError('请输入要查询的问题', 'AI_INPUT', 400)
    const limit = clampLimit(typeof body.limit === 'number' ? body.limit : undefined, 200, hard)
    const generated = await generateSql({
      question,
      connection: record,
      runtime,
      fallback: deps.aiFallback,
      connectionAi: record.ai,
      provider: typeof body.provider === 'string' && body.provider.trim() ? body.provider.trim() : undefined,
      model: typeof body.model === 'string' && body.model.trim() ? body.model.trim() : undefined,
      llm: deps.getLlm() as never,
    })
    const executed = await withSession(record, runtime, (session) =>
      session.runQuery({ sql: generated.sql, params: undefined, readOnly: true, allowWrite: false, hardLimit: limit }))
    sendJson(response, 200, { ...generated, result: executed })
  })

  return routes
}

/** 供 AI 生成层调用：类型转换帮助函数。 */
export function isQueryResult(value: unknown): value is QueryResult {
  return Boolean(value && typeof value === 'object' && Array.isArray((value as QueryResult).rows))
}
