import type { ConnectionRecord, QueryResult } from './types.ts'
import type { ConnectionStore } from './store.ts'
import { dialectMeta, withSession } from './manager.ts'
import { DbConsoleError } from './errors.ts'
import { isReadOnlyStatement, normalizeSchema, singleStatement } from './sqlutil.ts'

export interface ToolsDeps {
  store: ConnectionStore
  getCredentials?: (name: string) => Promise<string | undefined>
  maxRows: number
  log(level: 'info' | 'warn' | 'error', message: string): void
}

function resolveConnection(store: ConnectionStore, hint: unknown): ConnectionRecord {
  const text = typeof hint === 'string' ? hint.trim() : ''
  if (!text) throw new DbConsoleError('缺少 connection 参数（连接 id 或名称）', 'BAD_INPUT', 400)
  const byId = store.get(text)
  if (byId) return byId
  const byName = store.list().find((record) => record.name.toLowerCase() === text.toLowerCase())
  if (byName) {
    const full = store.get(byName.id)
    if (full) return full
  }
  const all = store.list().map((record) => `「${record.name}」(${record.id}, ${record.type})`).join('；')
  throw new DbConsoleError(`找不到数据库连接「${text}」。当前已配置：${all || '（无，请先在数据库工作台新建连接）'}`, 'NOT_FOUND', 404)
}

function connectionChoicesText(store: ConnectionStore): string {
  const list = store.list()
  if (list.length === 0) return '（当前没有任何已配置的数据库连接，请先让用户新建）'
  return list.map((record) => `- ${record.id}: ${record.name}（${dialectMeta(record.type).label}${record.hasPassword ? '' : '，未保存密码' }）`).join('\n')
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
      '列出数据库工作台（dsh-database-console）中已配置的数据库连接（名称/类型/是否已保存密码）。'
      + '用户提到“查一下数据库”时先调用本工具确认可用连接，再把连接 id 传给其他 db_* 工具。',
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
      if (typeof result.content === 'string' && result.content.length > 0) {
        return [{ type: 'text', text: result.content }]
      }
      return undefined
    },
  })))

  // 表列表
  disposers.push(sctx.tools.register(defineTool({
    name: 'db_tables',
    description:
      '列出某个数据库连接下的表/视图/集合。目标方言是 PostgreSQL/达梦时可用 schema 参数限定模式（省略则用连接默认 schema）。',
    parameters: {
      connection: { type: 'string', description: '连接 id 或名称（用 db_connections 查看）' },
      schema: { type: 'string', description: '可选：schema/owner（PostgreSQL、达梦）' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          ok: { type: 'boolean' },
          tables: { type: 'string', description: '表格文本' },
          error: { type: 'string' },
        },
      },
      render(_args: unknown, value: { ok?: boolean; tables?: string; error?: string }) {
        return value.ok ? (value.tables ?? '') : `错误：${value.error ?? '未知'}`
      },
    },
    async execute(args: { connection?: string; schema?: string }) {
      const record = resolveConnection(deps.store, args.connection)
      const schema = normalizeSchema(args.schema)
      const tables = await withSession(record, runtime(), (session) => session.listTables(schema))
      const text = tables.length === 0
        ? '（没有找到任何表/视图/集合）'
        : tables.map((table) => `- ${table.name} (${table.kind})`).join('\n')
      return { ok: true, tables: `连接「${record.name}」共 ${tables.length} 个对象：\n${text}` }
    },
    finalizeContent(_exec: unknown, result: { content?: unknown }) {
      if (typeof result.content === 'string' && result.content.length > 0) {
        return [{ type: 'text', text: result.content }]
      }
      return undefined
    },
  })))

  // 表结构
  disposers.push(sctx.tools.register(defineTool({
    name: 'db_table_schema',
    description: '查看某个表/视图/集合的字段结构（列名、类型、可空、主键、默认值）。生成 SQL 前先确认字段。',
    parameters: {
      connection: { type: 'string', description: '连接 id 或名称' },
      table: { type: 'string', description: '表名（MongoDB 为集合名）' },
      schema: { type: 'string', description: '可选：schema/owner（PostgreSQL、达梦）' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          ok: { type: 'boolean' },
          schema: { type: 'string' },
          error: { type: 'string' },
        },
      },
      render(_args: unknown, value: { ok?: boolean; schema?: string; error?: string }) {
        return value.ok ? (value.schema ?? '') : `错误：${value.error ?? '未知'}`
      },
    },
    async execute(args: { connection?: string; table?: string; schema?: string }) {
      const record = resolveConnection(deps.store, args.connection)
      const table = typeof args.table === 'string' ? args.table.trim() : ''
      if (!table) throw new DbConsoleError('缺少 table 参数', 'BAD_INPUT', 400)
      const target = normalizeSchema(args.schema)
      const columns = await withSession(record, runtime(), (session) => session.tableColumns(table, target))
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
      return { ok: true, schema: `表「${table}」字段（${columns.length}）：\n${text}` }
    },
    finalizeContent(_exec: unknown, result: { content?: unknown }) {
      if (typeof result.content === 'string' && result.content.length > 0) {
        return [{ type: 'text', text: result.content }]
      }
      return undefined
    },
  })))

  // 执行查询（只读）
  disposers.push(sctx.tools.register(defineTool({
    name: 'db_query',
    description:
      '在指定的数据库连接上执行只读 SQL 查询（SELECT/WITH/SHOW/EXPLAIN，禁止 DML/DDL；MongoDB 连接接受 JSON 过滤器文档）。'
      + '结果会以文本表格返回（最多 limit 行，默认 100）。生成 SQL 前先调用 db_table_schema 确认列名。',
    parameters: {
      connection: { type: 'string', description: '连接 id 或名称' },
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
          error: { type: 'string' },
        },
      },
      render(_args: unknown, value: { ok?: boolean; text?: string; rows?: number; error?: string }) {
        if (value.ok) return `查询成功（${value.rows ?? 0} 行）：\n${value.text ?? ''}`
        return `查询失败：${value.error ?? '未知'}`
      },
    },
    async execute(args: { connection?: string; sql?: string; limit?: number }) {
      const record = resolveConnection(deps.store, args.connection)
      const sql = typeof args.sql === 'string' ? args.sql.trim() : ''
      if (!sql) throw new DbConsoleError('缺少 sql 参数', 'BAD_INPUT', 400)
      if (record.type !== 'mongodb') {
        const statement = singleStatement(sql)
        if (!isReadOnlyStatement(statement)) {
          throw new DbConsoleError('db_query 只能执行只读查询；禁止 DML/DDL（如需写入请让用户到数据库工作台的 SQL 控制台手动执行）', 'WRITE_BLOCKED', 400)
        }
      }
      const maxRows = Math.min(Math.max(1, Math.trunc(args.limit ?? 100) || 100), 1000)
      const result = await withSession(record, runtime(), (session) =>
        session.runQuery({ sql, params: [], readOnly: true, allowWrite: false, hardLimit: maxRows }))
      return { ok: true, text: resultToText(result, 100), rows: result.rowCount }
    },
    finalizeContent(_exec: unknown, result: { content?: unknown }) {
      if (typeof result.content === 'string' && result.content.length > 0) {
        return [{ type: 'text', text: result.content }]
      }
      return undefined
    },
  })))

  return () => {
    for (const dispose of disposers) dispose()
  }
}
