import type { ConnectionRecord, RuntimeContext } from './types.ts'
import type { AiIntrospection } from './manager.ts'
import { introspectSchema } from './manager.ts'
import { DbConsoleError } from './errors.ts'
import { dialectMeta } from './manager.ts'
import { isReadOnlyStatement, singleStatement } from './sqlutil.ts'

/** cordis ctx 的最小结构（本插件只使用这些能力，避免运行时依赖 cordis 类型）。 */
export interface LlmLike {
  listProviders?: () => unknown[] | Promise<unknown[]>
  listModels?: (provider: string) => unknown[] | Promise<unknown[]>
  stream?: (options: Record<string, unknown>) => AsyncIterable<{ type: string; text?: string; reason?: string; error?: unknown }>
}

export interface AiSettings {
  provider?: string
  model?: string
  baseUrl?: string
  apiKey?: string
}

export interface AiResult {
  sql: string
  engine: 'custom' | 'harness'
  provider?: string
  model?: string
  note?: string
}

interface StreamChunk {
  type: string
  text?: string
  reason?: string
  error?: unknown
}

const SYSTEM_TEMPLATE = [
  '你是一个资深的数据库工程师，负责把用户的中文/自然语言问题转换为 SQL。',
  '规则：',
  '1. 只输出一条可直接执行的 SQL（不要 Markdown 代码块包裹，不要多余解释）。',
  '2. 目标方言：{{DIALECT}}。',
  '3. 只能查询（SELECT/WITH/SHOW/EXPLAIN 等），不要生成任何 DML/DDL。',
  '4. 使用给出的表结构；表名/列名不确定时结合信息猜测，并在无把握时返回：-- 无法确定：<原因>',
  '5. 字段值模糊时可用 LIKE；对可能的枚举值先不要假设。',
  '6. 如果用户问题超出数据库能力，返回：-- 不支持：<原因>',
  '',
  '以下是当前连接的数据库结构：',
  '',
  '{{SCHEMA}}',
].join('\n')

function buildUserPrompt(question: string): string {
  return [
    `请把下面的问题转换为 SQL（目标方言见系统提示）：`,
    '',
    question.trim(),
  ].join('\n')
}

function extractSql(raw: string): string {
  let text = raw.trim()
  // 去掉 ```sql ... ``` 代码块
  const fence = /^```[A-Za-z]*\s*([\s\S]*?)```$/u.exec(text)
  if (fence) text = fence[1]?.trim() ?? text
  // 找到第一条以 SELECT/WITH/SHOW/EXPLAIN 开头的语句（去掉前缀解释行）
  const lines = text.split('\n')
  const start = lines.findIndex((line) => /^\s*(select|with|show|explain)\b/iu.test(line))
  if (start > 0) text = lines.slice(start).join('\n').trim()
  if (!text) throw new DbConsoleError('AI 没有生成任何 SQL', 'AI_EMPTY', 502)
  if (text.startsWith('-- 无法确定') || text.startsWith('-- 不支持')) {
    throw new DbConsoleError(`AI 无法完成该查询：${text.slice(0, 300)}`, 'AI_REFUSED', 422)
  }
  return text
}

function makeSystemPrompt(dialectLabel: string, schemaText: string): string {
  return SYSTEM_TEMPLATE
    .replace('{{DIALECT}}', dialectLabel)
    .replace('{{SCHEMA}}', schemaText || '（未能读取到表结构，请根据常识生成尽量通用的 SQL）')
}

/** 走自定义 OpenAI 兼容 /chat/completions 端点。 */
async function callCustomEndpoint(settings: AiSettings, system: string, user: string): Promise<string> {
  const baseUrl = settings.baseUrl?.trim().replace(/\/+$/u, '')
  const model = settings.model?.trim() || 'deepseek-chat'
  if (!baseUrl) throw new DbConsoleError('自定义 AI 端点缺少 baseUrl', 'AI_CONFIG', 400)
  const key = settings.apiKey?.trim()
  if (!key) throw new DbConsoleError('自定义 AI 端点需要 API Key（连接设置 → AI 设置 → apiKey）', 'AI_CONFIG', 400)
  let response: Response
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
      signal: AbortSignal.timeout(90_000),
    })
  } catch (reason) {
    throw new DbConsoleError(`AI 端点请求失败：${reason instanceof Error ? reason.message : String(reason)}`, 'AI_NETWORK', 502)
  }
  const payload = await response.json().catch(() => null) as {
    error?: { message?: string }
    choices?: Array<{ message?: { content?: string } }>
  } | null
  if (!response.ok) {
    throw new DbConsoleError(`AI 端点返回错误（${response.status}）：${payload?.error?.message ?? '未知'}`, 'AI_ENDPOINT', 502)
  }
  const content = payload?.choices?.[0]?.message?.content
  if (!content) throw new DbConsoleError('AI 端点未返回内容', 'AI_EMPTY', 502)
  return content
}

/** 优先使用 DSH 已配置的模型（ctx.llm），找不到可用 provider 时返回 null。 */
async function callHarnessLlm(
  llm: LlmLike | null,
  settings: AiSettings,
  system: string,
  user: string,
): Promise<{ text: string; provider?: string; model?: string } | null> {
  if (!llm || typeof llm.stream !== 'function') return null
  let providers: unknown[]
  try {
    providers = llm.listProviders ? await llm.listProviders() : []
  } catch {
    return null
  }
  const providerNames = (providers ?? []).map((entry) => {
    const value = entry as Record<string, unknown>
    return String(value.id ?? value.name ?? value.provider ?? '')
  }).filter(Boolean)
  const configuredProvider = settings.provider?.trim()
  const provider = configuredProvider && providerNames.includes(configuredProvider)
    ? configuredProvider
    : providerNames.includes('deepseek')
      ? 'deepseek'
      : providerNames[0]
  if (!provider || !llm.stream) return null

  let model: string | undefined
  if (llm.listModels) {
    try {
      const models = (await llm.listModels(provider)) as Array<Record<string, unknown>>
      const ids = models.map((entry) => String(entry.id ?? entry.name ?? '')).filter(Boolean)
      const configuredModel = settings.model?.trim()
      model = configuredModel && ids.includes(configuredModel)
        ? configuredModel
        : ids.find((id) => id === 'deepseek-chat')
          ?? ids.find((id) => id.toLowerCase().includes('chat') && !id.toLowerCase().includes('reason'))
          ?? ids[0]
    } catch {
      model = settings.model?.trim() || undefined
    }
  } else {
    model = settings.model?.trim() || undefined
  }
  if (!model) return null

  const messages = [
    { role: 'user', content: [{ type: 'text', text: user }] },
  ]
  const started = Date.now()
  let output = ''
  let finishReason: string | null = null
  try {
    const stream = llm.stream({
      provider,
      model,
      messages,
      system,
      maxTokens: 2000,
      temperature: 0.1,
    })
    for await (const chunk of stream as AsyncIterable<StreamChunk>) {
      if (chunk.type === 'text-delta' && typeof chunk.text === 'string') output += chunk.text
      if (chunk.type === 'finish') finishReason = chunk.reason ?? null
    }
  } catch (reason) {
    throw new DbConsoleError(`调用 DSH 模型失败：${reason instanceof Error ? reason.message : String(reason)}`, 'AI_LLM', 502)
  }
  if (Date.now() - started > 90_000) {
    throw new DbConsoleError('AI 生成超时（>90s）', 'AI_TIMEOUT', 504)
  }
  if (!output.trim() || finishReason === 'error' || finishReason === 'aborted') {
    throw new DbConsoleError('AI 未生成内容（生成被中断或失败）', 'AI_EMPTY', 502)
  }
  return { text: output, provider, model }
}

export interface GenerateOptions {
  question: string
  connection: ConnectionRecord
  runtime: RuntimeContext
  /** 插件级 AI 配置（默认 provider/model 等） */
  fallback?: AiSettings
  /** 显式指定参与推理的 AI 设置（来自连接级 ai 字段） */
  connectionAi?: AiSettings
  /** 界面“按需选模型”：覆盖 provider（留空 = DSH 自动选择） */
  provider?: string
  /** 界面“按需选模型”：覆盖 model（留空 = DSH 自动选择） */
  model?: string
  /** 表结构摘要（不传则现场采集） */
  introspection?: AiIntrospection
  /** 测试时注入 llm 替身 */
  llm?: LlmLike | null
}

/**
 * 自然语言 → SQL。
 * 复用 DSH 自身配置的模型（不重复配置 provider/密钥）；界面可“按需选模型”。
 * 路由优先级：自定义端点(仅历史连接) > 连接/插件 provider > 请求 model 覆盖 > DSH 自动发现。
 */
export async function generateSql(options: GenerateOptions): Promise<AiResult> {
  const { connection, question } = options
  if (!question?.trim()) throw new DbConsoleError('请输入要查询的问题', 'AI_INPUT', 400)
  const introspection = options.introspection ?? await introspectSchema(connection, options.runtime)
  const dialectLabel = dialectMeta(connection.type).label
  const system = makeSystemPrompt(dialectLabel, introspection.schemaText)
  const user = buildUserPrompt(question)
  const merged: AiSettings = {
    ...options.fallback,
    ...options.connectionAi,
    ...(options.provider?.trim() ? { provider: options.provider.trim() } : {}),
    ...(options.model?.trim() ? { model: options.model.trim() } : {}),
  }

  const raw = merged.baseUrl?.trim()
    ? await callCustomEndpoint(merged, system, user)
    : null

  let generated: { text: string; provider?: string; model?: string } | null = null
  if (raw) {
    generated = { text: raw }
  } else {
    generated = await callHarnessLlm(options.llm ?? null, merged, system, user)
  }
  if (!generated) fallbackWithoutLlm(merged)

  let sql = extractSql(generated.text)
  try {
    sql = singleStatement(sql)
  } catch {
    // AI 生成可能带注释；注释可以保留，这里只处理空与多语句
    sql = sql.trim()
  }
  if (!isReadOnlyStatement(sql)) {
    throw new DbConsoleError('AI 生成的语句不是只读查询，已拦截（AI 只能生成 SELECT/WITH/SHOW/EXPLAIN）', 'AI_WRITE_BLOCKED', 422)
  }
  return {
    sql,
    engine: merged.baseUrl?.trim() ? 'custom' : 'harness',
    provider: generated.provider ?? merged.provider,
    model: generated.model ?? merged.model,
    note: introspection.tableCount > 0
      ? `已参考 ${introspection.tableCount} 张表 / ${introspection.columnCount} 个字段`
      : '未能读取表结构，生成的 SQL 可能不准确',
  }
}

function fallbackWithoutLlm(settings: AiSettings): never {
  if (settings.provider || settings.model) {
    throw new DbConsoleError('未找到所选模型的路由，请检查 DSH 的模型配置，或改选其它模型', 'AI_NO_ROUTE', 502)
  }
  throw new DbConsoleError(
    '无法调用 AI：当前 DSH 没有可用的模型。请在 DSH 的 AI/模型设置中完成配置（本插件直接复用 DSH 模型，无需重复填写）',
    'AI_NO_ROUTE',
    502,
  )
}
