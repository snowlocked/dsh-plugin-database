import { resolve } from 'node:path'
import { createConnectionStore, defaultDataDir, isValidConnectionId } from './store.ts'
import { buildApiRoutes, type HttpRoute, type HttpRequest, type HttpResponse } from './http.ts'
import { registerDatabaseTools } from './tools.ts'
import type { AiSettings } from './ai.ts'
import type { ConnectionStore } from './store.ts'

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
        log('info', 'DB 工具注册完成（db_connections / db_tables / db_table_schema / db_query）')
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

  // 系统提示：告诉对话中的 AI 如何使用这些工具
  ctx.inject(['systemPrompt'], (sctx) => {
    sctx.effect(() => {
      const section = (sctx.systemPrompt as { section(options: unknown): () => void }).section({
        name: 'dsh-database-console:tools',
        order: 500,
        text: [
          '## 数据库工具（dsh-database-console）',
          '',
          '你可以在对话中直接操作“数据库工作台”插件里已保存的数据库连接：',
          '- `db_connections`：列出已配置连接；',
          '- `db_tables`：列出连接下的表/视图/集合；',
          '- `db_table_schema`：查看表结构（生成 SQL 前建议先确认列名）；',
          '- `db_query`：执行只读 SQL（MongoDB 连接传 JSON 过滤器文档）。',
          '',
          '规则：只能用 db_query 做 SELECT/WITH/SHOW/EXPLAIN 等只读查询，禁止 DML/DDL；',
          '查询前先确认字段名与类型；行数上限默认 100。',
          '如果用户想要可视化的表浏览或 SQL 编辑，提醒打开“数据库工作台”（左侧菜单数据库入口）。',
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
