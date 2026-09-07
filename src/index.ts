import { resolve } from 'node:path'
import { createConnectionStore, defaultDataDir, isValidConnectionId } from './store.ts'
import { buildApiRoutes, type HttpRoute, type HttpRequest, type HttpResponse } from './http.ts'
import { registerDatabaseTools } from './tools.ts'
import { connectionAliases } from './lookup.ts'
import { dialectMeta } from './manager.ts'
import type { AiSettings } from './ai.ts'
import type { ConnectionStore } from './store.ts'

// 供单测/冒烟直接调用（纯函数，无 IO）
export { findConnectionByRef, connectionAliases } from './lookup.ts'

export const name = 'dsh-database-console'
/** 服务端需要等待注入的服务（webServer 最先，其余在 apply 内按需注入） */
export const inject: string[] = ['webServer']

export interface PluginConfig {
  /** 连接配置文件目录（默认 <DSH_HOME>/dsh-database） */
  dataDir?: string
  /** 查询/预览默认最大行数（1~10000，默认 1000） */
  maxRows?: number
  /** 全局默认 AI provider/model（一般留空：直接复用 DSH 自身配置的模型，界面按需选模型） */
  ai?: AiSettings
}

/** cordis ctx 的最小结构（服务端仅用到这些成员）。 */
interface CtxLike {
  inject(names: string[], callback: (sctx: SubCtxLike) => void): void
  get<T = unknown>(name: string): T | undefined
  logger?: {
    info(message: string, ...args: unknown[]): void
    warn(message: string, ...args: unknown[]): void
    error(message: string, ...args: unknown[]): void
  }
}

/** ctx.inject 回调收到的子上下文：含注入的服务成员与 effect 生命周期。 */
interface SubCtxLike {
  effect(callback: () => void | (() => void), label?: string): void
  [key: string]: unknown
}

function clampMaxRows(value: unknown): number {
  const parsed = typeof value === 'number' ? Math.trunc(value) : Number(value)
  if (!Number.isFinite(parsed)) return 1000
  return Math.min(10_000, Math.max(1, parsed))
}

/** 系统提示里的连接目录行：名称/类型/主机/默认库与口语别名。 */
function catalogLines(store: ConnectionStore): string[] {
  const list = store.list()
  if (list.length === 0) return ['- （当前还没有保存任何连接，先让用户在“数据库工作台”里新建）']
  return list.map((record) => {
    const meta = dialectMeta(record.type)
    const parts: string[] = [meta.label]
    if (record.host) {
      parts.push(`${record.host}${record.port ? `:${record.port}` : meta.defaultPort ? `:${meta.defaultPort}` : ''}`)
    }
    if (record.database) parts.push(`库 ${record.database}`)
    if (record.schema) parts.push(`schema ${record.schema}`)
    const aliases = connectionAliases(record).slice(1)
    const aliasHint = aliases.length > 0 ? `，可写作：${aliases.join(' / ')}` : ''
    return `- 「${record.name}」(${record.id}) · ${parts.join('，')}${aliasHint}`
  })
}

export function apply(ctx: CtxLike, config: PluginConfig = {}): void {
  const log = (level: 'info' | 'warn' | 'error', message: string): void => {
    try {
      ctx.logger?.[level](`[dsh-database-console] ${message}`)
    } catch {
      // logger 不可用时静默
    }
  }
  const dataDir = resolve(config.dataDir && config.dataDir.length > 0 ? config.dataDir : defaultDataDir())
  const maxRows = clampMaxRows(config.maxRows)
  const store: ConnectionStore = createConnectionStore(dataDir, (message) => log('info', message))

  // credentials 服务可能晚于插件加载，运行期动态解析（cred:NAME 密码引用）
  const resolveCredential = async (credName: string): Promise<string | undefined> => {
    const credentials = ctx.get<{ resolve?: (name: string) => Promise<unknown> }>('credentials')
    if (!credentials?.resolve) return undefined
    try {
      const resolved = await credentials.resolve(credName)
      if (resolved && typeof resolved === 'object' && 'value' in resolved) {
        const value = (resolved as { value?: unknown }).value
        return typeof value === 'string' ? value : undefined
      }
      if (typeof resolved === 'string' && resolved.length > 0) return resolved
      return undefined
    } catch {
      return undefined
    }
  }

  const apiDeps = {
    store,
    getCredentials: resolveCredential,
    log,
    maxRows,
    aiFallback: config.ai ?? {},
    getLlm: () => ctx.get('llm') ?? undefined,
  }

  // HTTP API
  ctx.inject(['webServer'], (sctx) => {
    sctx.effect(() => {
      const routes: HttpRoute[] = buildApiRoutes(apiDeps)
      routes.push({
        kind: 'exact',
        path: '/api/dsh-database-console/state',
        method: 'POST',
        handler: async (request: HttpRequest, response: HttpResponse) => {
          if (request.method && request.method.toUpperCase() !== 'POST') {
            response.statusCode = 405
            response.end()
            return
          }
          response.statusCode = 200
          response.setHeader('content-type', 'application/json; charset=utf-8')
          response.end(JSON.stringify({
            ok: true,
            name,
            version: '0.1.0',
            maxRows,
            dataDir,
            storeFile: store.file,
            supportedTypes: ['postgresql', 'mysql', 'mongodb', 'sqlite', 'dameng'],
          }))
        },
      })
      const disposers = routes.map((route) => {
        const webServer = sctx.webServer as { register(route: HttpRoute): () => void }
        return webServer.register(route)
      })
      return () => {
        for (const dispose of disposers) dispose()
      }
    }, 'dsh-database-console: http api')
  })

  // 对话 AI 可调用的 DB 工具（只读）
  ctx.inject(['tools'], (sctx) => {
    sctx.effect(() => {
      let dispose: (() => void) | undefined
      let settled = false
      registerDatabaseTools(sctx as unknown as { tools: { register(tool: unknown): () => void } }, {
        store,
        getCredentials: resolveCredential,
        maxRows,
        log,
      }).then((result) => {
        dispose = result
        settled = true
        log('info', 'DB 工具注册完成（db_connections / db_tables / db_table_schema / db_query / db_databases）')
      }).catch((reason) => {
        settled = true
        log('warn', `DB 工具注册失败：${reason instanceof Error ? reason.message : String(reason)}`)
      })
      return () => {
        void settled
        dispose?.()
      }
    }, 'dsh-database-console: db tools')
  })

  // 系统提示：告诉对话中的 AI 如何使用这些工具（含当前已保存连接的“目录 + 口语别名”）
  ctx.inject(['systemPrompt'], (sctx) => {
    sctx.effect(() => {
      const section = (sctx.systemPrompt as { section(options: unknown): () => void }).section({
        name: 'dsh-database-console:tools',
        order: 500,
        text: [
          '## 数据库工具（dsh-database-console）',
          '',
          '你可以在对话里直接查询“数据库工作台”插件已保存的连接。用户口语里的说法请先翻译成工具参数：',
          '- connection 参数：连接 id、名称或**口语别名**都行。下面目录“可写作”里的别名指向同一连接',
          '  （如“36”/“48.36”都指主机 192.168.48.36 那条）。拿不准先调 db_connections。',
          '- database 参数：PG/MySQL/MongoDB 一条连接固定在一个库；用户提到“xx 服务器上的别的库”时，',
          '  先用 db_databases 看该服务器上有哪些库，再在 db_tables / db_table_schema / db_query 传 database 切换。',
          '- schema 参数：PostgreSQL/达梦的模式(owner)；MySQL 的库与 schema 同义。',
          '- 流程：先 db_tables 定位表/集合（不确定列名时再 db_table_schema）→ db_query 只读执行。',
          '  如“查一下 36 数据库 test2 里的 Item 表”→ 先 db_tables(connection=36, database=test2) 确认，',
          '  再 db_query(connection=36, database=test2, sql=\'SELECT * FROM "Item" LIMIT 20\')。',
          '规则：只用 db_query 做 SELECT/WITH/SHOW/EXPLAIN 等只读查询，禁止 DML/DDL；行数上限默认 100。',
          '需要可视化表浏览或 SQL 编辑时，提醒用户打开左侧“数据库”工作台。',
          '',
          '当前已保存的连接（插件启动时快照，如有出入以 db_connections 返回为准）：',
          ...catalogLines(store),
        ].join('\n'),
      })
      return section
    }, 'dsh-database-console: prompt section')
  })

  log('info', `插件已加载：数据目录=${dataDir}，默认最大行数=${maxRows}`)
}

/** 供工具使用：id 校验导出。 */
export function isStoreIdValid(id: string): boolean {
  return isValidConnectionId(id)
}
