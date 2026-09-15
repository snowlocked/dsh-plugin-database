import type { ConnectionRecord, QueryResult } from './types.ts'
import type { ConnectionStore } from './store.ts'
import { dialectMeta, withSharedSession } from './manager.ts'
import { DbConsoleError } from './errors.ts'
import { isReadOnlyStatement, normalizeSchema, singleStatement } from './sqlutil.ts'
import { connectionAliases, findConnectionByRef } from './lookup.ts'

export interface ToolsDeps {
  store: ConnectionStore
  getCredentials?: (name: string) => Promise<string | undefined>
  maxRows: number
  log(level: 'info' | 'warn' | 'error', message: string): void
}

export interface ResolvedConnection {
  record: ConnectionRecord
  /** 精确 id 命中时为 undefined；按名称/主机/别名命中时给出命中原文 */
  via?: 'name' | 'host'
  alias?: string
}

/**
 * 解析 connection 参数：优先精确 id / 名称，再按名称/主机的段与点分后缀做别名匹配
 * （例如“36”、“48.36”、“192.168.48.36”都能指向主机 192.168.48.36 的那条连接）。
 * 同层命中多条 → 明确报错列出候选，避免猜错库。
 */
function resolveConnection(store: ConnectionStore, hint: unknown): ResolvedConnection {
  const text = typeof hint === 'string' ? hint.trim() : ''
  if (!text) throw new DbConsoleError('缺少 connection 参数（连接 id、名称或主机别名）', 'BAD_INPUT', 400)
  const byId = store.get(text)
  if (byId) return { record: byId }
  const outcome = findConnectionByRef(store.list(), text)
  if (outcome.found) {
    const full = store.get(outcome.found.record.id)
    if (full) {
      return {
        record: full,
        via: outcome.found.via === 'name' ? 'name' : outcome.found.via === 'host' ? 'host' : undefined,
        alias: outcome.found.alias,
      }
    }
  }
  if (outcome.ambiguous) {
    const lines = outcome.ambiguous
      .map((record) => connectionLine(record))
      .join('\n')
    throw new DbConsoleError(
      `「${text}」同时匹配到 ${outcome.ambiguous.length} 条连接，请把 connection 说得更明确（用完整名称、id 或主机）：\n${lines}`,
      'AMBIGUOUS_CONNECTION',
      404,
    )
  }
  throw new DbConsoleError(
    `找不到数据库连接「${text}」。当前已配置（connection 可直接写名称/主机/别名，例如“36”指主机 192.168.48.36）：\n${connectionChoicesText(store)}`,
    'NOT_FOUND',
    404,
  )
}

/** 一条连接的目录文本（类型、主机、默认库/模式与可用的口语别名）。 */
function connectionLine(record: { id: string; name: string; type?: string; host?: string; port?: number; database?: string; schema?: string; hasPassword?: boolean }): string {
  const meta = record.type ? dialectMeta(record.type as ConnectionRecord['type']) : { label: '连接', defaultPort: null }
  const parts: string[] = [meta.label]
  if (record.host) parts.push(`${record.host}${record.port ? `:${record.port}` : meta.defaultPort ? `:${meta.defaultPort}` : ''}`)
  if (record.database) parts.push(`库 ${record.database}`)
  if (record.schema) parts.push(`schema ${record.schema}`)
  if (record.hasPassword === false) parts.push('未保存密码')
  const aliases = connectionAliases(record).slice(1)
  const aliasHint = aliases.length > 0 ? `；可写作：${aliases.join(' / ')}` : ''
  const extra = parts.length > 0 ? `（${parts.join('，')}${aliasHint}）` : ''
  return `- ${record.id}: ${record.name}${extra}`
}

function connectionChoicesText(store: ConnectionStore): string {
  const list = store.list()
  if (list.length === 0) return '（当前没有任何已配置的数据库连接，请先让用户新建）'
  return list.map((record) => connectionLine(record)).join('\n')
}

/**
 * 应用可选的 database 覆盖：同一台服务器（PostgreSQL/MySQL/MongoDB）常挂多个库，
 * 连接记录只固定一个默认库；用户说“xx 库里的表”而目标不是默认库时传 database 切换。
 * SQLite（单文件）与达梦（按用户/模式组织）不支持跨库切换。
 */
function applyDatabase(record: ConnectionRecord, raw: unknown): ConnectionRecord {
  const value = typeof raw === 'string' ? raw.trim() : ''
  if (!value) return record
  if (record.type === 'sqlite') {
    throw new DbConsoleError('SQLite 连接是单文件数据库，没有“切换库”；如需其它文件请让用户新建连接', 'BAD_DATABASE', 400)
  }
  if (record.type === 'dameng') {
    throw new DbConsoleError('达梦按 用户/模式(owner) 组织对象，无跨库切换；如需其它模式请传 schema 参数', 'BAD_DATABASE', 400)
  }
  if (value.length > 128) throw new DbConsoleError('database 名称过长', 'BAD_DATABASE', 400)
  return { ...record, database: value }
}

/** 组装输出里的 note 字段：告诉模型实际用到了哪条连接/哪个库（别名或库切换时才有内容）。 */
function effectiveNote(resolved: ResolvedConnection, databaseOverride?: string): string {
  const bits: string[] = []
  if (resolved.via === 'host') {
    bits.push(`connection 按主机/别名「${resolved.alias ?? ''}」命中「${resolved.record.name}」(${resolved.record.host ?? ''})`)
  } else if (resolved.via === 'name' && resolved.alias && resolved.alias.toLowerCase() !== resolved.record.name.toLowerCase()) {
    bits.push(`connection 按别名「${resolved.alias}」命中「${resolved.record.name}」`)
  }
  if (databaseOverride) {
    bits.push(`database 切换为「${databaseOverride}」（连接默认 ${resolved.record.database ?? '无'}）`)
  }
  return bits.join('；')
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  const text = String(value)
  return text.length > 160 ? `${text.slice(0, 160)}…` : text
}

function resultToText(result: QueryResult, maxRows: number): string {
  const header = result.columns.join(' | ')
  const lines = result.rows.slice(0, maxRows).map((row) => row.map((cell) => cellText(cell)).join(' | '))
  const more = result.rows.length > maxRows ? `\n…（仅显示前 ${maxRows} 行，共 ${result.rowCount} 行）` : ''
  const footer = result.message ? `\n${result.message}` : ''
  return [header, ...lines].join('\n') + more + footer
}

/** 注册可供对话中 AI 直接调用的数据库工具（require tools 服务）。 */
export async function registerDatabaseTools(
  sctx: { tools: { register(tool: unknown): () => void } },
  deps: ToolsDeps,
): Promise<() => void> {
  let defineTool: ((options: Record<string, unknown>) => unknown) | null = null
  try {
    const module = await import('@deepseek-ai/dsh-tools') as { defineTool?: (options: Record<string, unknown>) => unknown }
    defineTool = module.defineTool ?? null
  } catch {
    deps.log('warn', 'dsh-tools 不可用，跳过 DB 对话工具注册（AI 工具功能不可用，其余功能不受影响）')
  }
  if (!defineTool) return () => undefined

  const runtime = () => ({ log: deps.log, resolveCredential: deps.getCredentials })
  const disposers: Array<() => void> = []

  // 连接列表
  disposers.push(sctx.tools.register(defineTool({
    name: 'db_connections',
    description:
      '列出数据库工作台（dsh-database-console）中已配置的数据库连接：id、名称、类型、主机、默认库/模式、以及可用的口语别名'
      + '（例如主机 192.168.48.36 的连接可以直接写作 “36” 或 “48.36”）。'
      + '用户提到“查一下 xxx 数据库/服务器/主机”时，先看本工具把说法映射到连接；其余 db_* 工具的 connection 参数直接填 id、名称或别名均可。',
    parameters: {},
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          connections: { type: 'string', description: '文本形式展示的连接清单' },
        },
      },
      render(_args: unknown, value: { connections?: string }) {
        return value.connections ?? '（空）'
      },
    },
    async execute() {
      return { connections: connectionChoicesText(deps.store) }
    },
    finalizeContent(_exec: unknown, result: { content?: unknown }) {
      if (typeof result.content === 'string') {
        // 空字符串也必须归一化为文本块：裸字符串（含 ""）留在 content 上，宿主
        // contentHasImage 递归遍历 tool-result 块时会对它调 .some，抛
        // "content.some is not a function" 直接炸掉整个模型回合（k8s 插件已踩过）。
        const text = result.content.length > 0 ? result.content : '（工具执行成功，无输出）'
        return [{ type: 'text', text }]
      }
      return undefined
    },
  })))

  // 服务器上的数据库列表（PG/MySQL；连接本身固定在一个库时用于发现同一台主机的其它库）
  disposers.push(sctx.tools.register(defineTool({
    name: 'db_databases',
    description:
      '列出某个数据库连接所在服务器的全部数据库（PostgreSQL/MySQL）。当用户提到的库名不是该连接的默认库'
      + '（比如“36 服务器上的 test1 库”而连接默认是 test2）时，先调用本工具确认库名，再在 db_tables/db_query 里传 database 参数切换。'
      + 'SQLite/达梦/MongoDB 返回 supported=false（连接本身即库，或用 schema）。',
    parameters: {
      connection: { type: 'string', description: '连接 id、名称或别名（用 db_connections 查看）' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          ok: { type: 'boolean' },
          databases: { type: 'string', description: '数据库清单文本' },
          supported: { type: 'boolean' },
          note: { type: 'string' },
          error: { type: 'string' },
        },
      },
      render(_args: unknown, value: { ok?: boolean; databases?: string; note?: string; error?: string }) {
        return value.ok ? (value.databases ?? '') : `不支持/失败：${value.error ?? value.note ?? '未知'}`
      },
    },
    async execute(args: { connection?: string }) {
      const resolved = resolveConnection(deps.store, args.connection)
      const record = resolved.record
      const databases = await withSharedSession(record, runtime(), (session) =>
        typeof session.listDatabases === 'function' ? session.listDatabases() : Promise.resolve(undefined))
      if (!databases) {
        return {
          ok: false,
          supported: false,
          error: `连接「${record.name}」(${dialectMeta(record.type).label})不支持服务器级数据库列表：连接本身即为库（达梦如需别的模式请传 schema）。`,
        }
      }
      const note = effectiveNote(resolved)
      const text = databases.length === 0
        ? '（服务器上没有可用的数据库，请检查账号权限）'
        : `连接「${record.name}」（${record.host ?? ''}）服务器上的数据库（${databases.length}）：\n${databases.map((name) => `- ${name}${name === record.database ? '（当前连接默认）' : ''}`).join('\n')}`
      return { ok: true, supported: true, databases: text, ...(note ? { note } : {}) }
    },
    finalizeContent(_exec: unknown, result: { content?: unknown }) {
      if (typeof result.content === 'string') {
        // 空字符串也必须归一化为文本块：裸字符串（含 ""）留在 content 上，宿主
        // contentHasImage 递归遍历 tool-result 块时会对它调 .some，抛
        // "content.some is not a function" 直接炸掉整个模型回合（k8s 插件已踩过）。
        const text = result.content.length > 0 ? result.content : '（工具执行成功，无输出）'
        return [{ type: 'text', text }]
      }
      return undefined
    },
  })))

  // 表列表
  disposers.push(sctx.tools.register(defineTool({
    name: 'db_tables',
    description:
      '列出某个数据库连接下的表/视图/集合。connection 支持 id、名称或口语别名（如“36”指主机 192.168.48.36 那条连接）；'
      + 'database 可选：同一台服务器上的其它库（PostgreSQL/MySQL/MongoDB）用它在不新建连接的情况下切换；'
      + 'schema/owner 仅 PostgreSQL、达梦需要（MySQL 的库与 schema 同义，直接传 database 或 schema 均可）。',
    parameters: {
      connection: { type: 'string', description: '连接 id、名称或别名（用 db_connections 查看）' },
      database: { type: 'string', description: '可选：要列出的库名（默认连接保存的库；PG/MySQL/MongoDB 可切换）' },
      schema: { type: 'string', description: '可选：schema/owner（PostgreSQL、达梦）' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          ok: { type: 'boolean' },
          tables: { type: 'string', description: '表格文本' },
          note: { type: 'string', description: '实际使用的连接/库说明（别名或库切换时）' },
          error: { type: 'string' },
        },
      },
      render(_args: unknown, value: { ok?: boolean; tables?: string; note?: string; error?: string }) {
        if (!value.ok) return `错误：${value.error ?? '未知'}`
        return value.note ? `${value.tables ?? ''}\n注：${value.note}` : (value.tables ?? '')
      },
    },
    async execute(args: { connection?: string; database?: string; schema?: string }) {
      const resolved = resolveConnection(deps.store, args.connection)
      const databaseOverride = args.database && args.database.trim() ? args.database.trim() : undefined
      const record = applyDatabase(resolved.record, databaseOverride)
      const schema = normalizeSchema(args.schema)
      const tables = await withSharedSession(record, runtime(), (session) => session.listTables(schema))
      const note = effectiveNote(resolved, databaseOverride)
      const text = tables.length === 0
        ? '（没有找到任何表/视图/集合）'
        : tables.map((table) => `- ${table.name} (${table.kind})`).join('\n')
      return { ok: true, tables: `连接「${record.name}」${schema ? `schema ${schema}` : ''}下共 ${tables.length} 个对象：\n${text}`, ...(note ? { note } : {}) }
    },
    finalizeContent(_exec: unknown, result: { content?: unknown }) {
      if (typeof result.content === 'string') {
        // 空字符串也必须归一化为文本块：裸字符串（含 ""）留在 content 上，宿主
        // contentHasImage 递归遍历 tool-result 块时会对它调 .some，抛
        // "content.some is not a function" 直接炸掉整个模型回合（k8s 插件已踩过）。
        const text = result.content.length > 0 ? result.content : '（工具执行成功，无输出）'
        return [{ type: 'text', text }]
      }
      return undefined
    },
  })))

  // 表结构
  disposers.push(sctx.tools.register(defineTool({
    name: 'db_table_schema',
    description:
      '查看某个表/视图/集合的字段结构（列名、类型、可空、主键、默认值）。生成 SQL 前先确认字段。'
      + 'connection 支持别名；database 可选（同 db_tables）；schema 仅 PostgreSQL、达梦。',
    parameters: {
      connection: { type: 'string', description: '连接 id、名称或别名' },
      table: { type: 'string', description: '表名（MongoDB 为集合名）' },
      database: { type: 'string', description: '可选：库名（默认连接保存的库）' },
      schema: { type: 'string', description: '可选：schema/owner（PostgreSQL、达梦）' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          ok: { type: 'boolean' },
          schema: { type: 'string' },
          note: { type: 'string' },
          error: { type: 'string' },
        },
      },
      render(_args: unknown, value: { ok?: boolean; schema?: string; note?: string; error?: string }) {
        if (!value.ok) return `错误：${value.error ?? '未知'}`
        return value.note ? `${value.schema ?? ''}\n注：${value.note}` : (value.schema ?? '')
      },
    },
    async execute(args: { connection?: string; table?: string; database?: string; schema?: string }) {
      const resolved = resolveConnection(deps.store, args.connection)
      const databaseOverride = args.database && args.database.trim() ? args.database.trim() : undefined
      const record = applyDatabase(resolved.record, databaseOverride)
      const table = typeof args.table === 'string' ? args.table.trim() : ''
      if (!table) throw new DbConsoleError('缺少 table 参数', 'BAD_INPUT', 400)
      const target = normalizeSchema(args.schema)
      const columns = await withSharedSession(record, runtime(), (session) => session.tableColumns(table, target))
      const note = effectiveNote(resolved, databaseOverride)
      const lines = columns.map((column) => {
        const flags = [
          column.primary ? 'PK' : '',
          column.nullable === false ? 'NOT NULL' : '',
        ].filter(Boolean).join(',')
        const def = column.defaultValue !== undefined && column.defaultValue !== null ? ` DEFAULT ${column.defaultValue}` : ''
        const comment = column.comment ? ` // ${column.comment}` : ''
        return `- ${column.name} ${column.type}${flags ? ` [${flags}]` : ''}${def}${comment}`
      })
      const text = columns.length === 0
        ? '（未能读取到字段结构，请确认表名与权限）'
        : lines.join('\n')
      return { ok: true, schema: `表「${table}」字段（${columns.length}）：\n${text}`, ...(note ? { note } : {}) }
    },
    finalizeContent(_exec: unknown, result: { content?: unknown }) {
      if (typeof result.content === 'string') {
        // 空字符串也必须归一化为文本块：裸字符串（含 ""）留在 content 上，宿主
        // contentHasImage 递归遍历 tool-result 块时会对它调 .some，抛
        // "content.some is not a function" 直接炸掉整个模型回合（k8s 插件已踩过）。
        const text = result.content.length > 0 ? result.content : '（工具执行成功，无输出）'
        return [{ type: 'text', text }]
      }
      return undefined
    },
  })))

  // 执行查询（只读）
  disposers.push(sctx.tools.register(defineTool({
    name: 'db_query',
    description:
      '在指定的数据库连接上执行只读 SQL 查询（SELECT/WITH/SHOW/EXPLAIN，禁止 DML/DDL；MongoDB 连接接受 JSON 过滤器文档）。'
      + '结果以文本表格返回（最多 limit 行，默认 100）。生成 SQL 前先调用 db_table_schema 确认列名。'
      + 'connection 支持 id/名称/别名；database 可选：目标库不是连接默认库时传库名（如“36 服务器上的 test1 库”，先 db_databases 查库名）。'
      + 'SQL 里可直接写 schema/表限定名，也可以写裸表名由库默认解析。',
    parameters: {
      connection: { type: 'string', description: '连接 id、名称或别名' },
      database: { type: 'string', description: '可选：目标库名（默认连接保存的库）' },
      sql: {
        type: 'string',
        description: '要执行的 SQL；MongoDB 连接时为 JSON，如 {"collection":"orders","filter":{"status":"paid"},"limit":20}',
      },
      limit: { type: 'number', description: '可选：最多返回行数（1~1000，默认 100）' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          ok: { type: 'boolean' },
          text: { type: 'string' },
          rows: { type: 'number' },
          note: { type: 'string', description: '实际使用的连接/库说明（别名或库切换时）' },
          error: { type: 'string' },
        },
      },
      render(_args: unknown, value: { ok?: boolean; text?: string; rows?: number; note?: string; error?: string }) {
        if (!value.ok) return `查询失败：${value.error ?? '未知'}`
        const note = value.note ? `\n注：${value.note}` : ''
        return `查询成功（${value.rows ?? 0} 行）：\n${value.text ?? ''}${note}`
      },
    },
    async execute(args: { connection?: string; database?: string; sql?: string; limit?: number }) {
      const resolved = resolveConnection(deps.store, args.connection)
      const databaseOverride = args.database && args.database.trim() ? args.database.trim() : undefined
      const record = applyDatabase(resolved.record, databaseOverride)
      const sql = typeof args.sql === 'string' ? args.sql.trim() : ''
      if (!sql) throw new DbConsoleError('缺少 sql 参数', 'BAD_INPUT', 400)
      if (record.type !== 'mongodb') {
        const statement = singleStatement(sql)
        if (!isReadOnlyStatement(statement)) {
          throw new DbConsoleError('db_query 只能执行只读查询；禁止 DML/DDL（如需写入请让用户到数据库工作台的 SQL 控制台手动执行）', 'WRITE_BLOCKED', 400)
        }
      }
      const maxRows = Math.min(Math.max(1, Math.trunc(args.limit ?? 100) || 100), 1000)
      const result = await withSharedSession(record, runtime(), (session) =>
        session.runQuery({ sql, params: [], readOnly: true, allowWrite: false, hardLimit: maxRows }))
      const note = effectiveNote(resolved, databaseOverride)
      return { ok: true, text: resultToText(result, 100), rows: result.rowCount, ...(note ? { note } : {}) }
    },
    finalizeContent(_exec: unknown, result: { content?: unknown }) {
      if (typeof result.content === 'string') {
        // 空字符串也必须归一化为文本块：裸字符串（含 ""）留在 content 上，宿主
        // contentHasImage 递归遍历 tool-result 块时会对它调 .some，抛
        // "content.some is not a function" 直接炸掉整个模型回合（k8s 插件已踩过）。
        const text = result.content.length > 0 ? result.content : '（工具执行成功，无输出）'
        return [{ type: 'text', text }]
      }
      return undefined
    },
  })))

  return () => {
    for (const dispose of disposers) dispose()
  }
}
