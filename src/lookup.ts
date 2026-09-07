/**
 * 连接“口语引用”解析：把用户/模型说出的“36 数据库”、“48.36”、“192.168.48.36”这类
 * 简写解析到已保存的连接记录。纯函数、无 IO，便于单测与复用。
 *
 * 匹配优先级（越靠前越强）：
 *   1. 连接 id（db_xxxx）
 *   2. 连接名称精确相等（忽略大小写）
 *   3. 主机名/IP 精确相等
 *   4. 名称或主机的“段”精确相等（如名称 48.36 的段 36；主机 192.168.48.36 的段 36）
 *   5. 名称/主机的“点分后缀”相等（如 48.36、168.48.36）
 * 同层命中多条 → 视为歧义，交给调用方报错列出候选（而不是猜错库）。
 */

/** 解析所需的连接字段子集（脱敏列表或完整记录均可传入）。 */
export interface ConnectionRefRecord {
  id: string
  name: string
  type?: string
  host?: string
  database?: string
  schema?: string
}

export type RefMatchVia = 'id' | 'name' | 'host'

export interface ConnectionRefMatch {
  record: ConnectionRefRecord
  /** 命中方式：精确 id / 名称 / 主机相关 */
  via: RefMatchVia
  /** 命中时用户写的原文（转小写），用于提示与展示 */
  alias: string
}

export interface RefLookupOutcome {
  /** 唯一命中（同层只有一条时才有） */
  found?: ConnectionRefMatch
  /** 同层命中多条（歧义候选，按名称排序） */
  ambiguous?: ConnectionRefRecord[]
  /** 一条都没命中 */
  none?: boolean
}

/** 解析参考串的“段”：按 . 空格 _ - 切分。 */
function splitTokens(value: string | undefined): string[] {
  if (!value) return []
  return value
    .toLowerCase()
    .split(/[.\s_\-]+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
}

/** 参考串本身也切一下，便于拿“多段写法”与记录段序列做子序列匹配。 */
function refTokens(ref: string): string[] {
  const parts = splitTokens(ref)
  if (parts.length === 0 && ref.trim().length > 0) return [ref.trim().toLowerCase()]
  return parts
}

/** 连续段拼接出的全部后缀（如 host 192.168.48.36 → 48.36、36…），含整串自身。 */
function suffixes(tokens: string[]): string[] {
  const out: string[] = []
  for (let start = 0; start < tokens.length; start += 1) {
    out.push(tokens.slice(start).join('.'))
  }
  return out
}

/**
 * 计算某记录相对该参考串的最佳档位。
 * 返回 >0 表示命中；数值越大越具体。参考串可含多段（如“48.36”）也可只一段（如“36”）。
 */
function bestTier(record: ConnectionRefRecord, refLower: string, rparts: string[]): { tier: number; via: RefMatchVia } | null {
  const nameLower = record.name.trim().toLowerCase()
  const hostLower = (record.host ?? '').trim().toLowerCase()
  if (record.id.toLowerCase() === refLower) return { tier: 400, via: 'id' }
  if (nameLower === refLower) return { tier: 300, via: 'name' }
  if (hostLower === refLower) return { tier: 300, via: 'host' }

  // 参考串整段出现在名称/主机的“点分后缀”里（如 48.36 / 168.48.36）
  const nameTokens = splitTokens(record.name)
  const hostTokens = splitTokens(record.host)
  const refWhole = rparts.join('.')
  if (refWhole && (suffixes(nameTokens).includes(refWhole) || suffixes(hostTokens).includes(refWhole))) {
    const via = suffixes(hostTokens).includes(refWhole) ? 'host' : 'name'
    return { tier: 220, via }
  }

  // 单段参考：与名称或主机的某个段相等（36 ∈ 48.36 / 192.168.48.36）
  if (rparts.length === 1) {
    const single = rparts[0] ?? ''
    if (single && (nameTokens.includes(single) || hostTokens.includes(single))) {
      const via = hostTokens.includes(single) ? 'host' : 'name'
      return { tier: 200, via }
    }
    // 参考比段更长（如 48.36.1 之类）但包含在某个段内？不处理，避免误匹配。
  }
  return null
}

/** 解析一条参考串；纯函数，不抛错、不依赖 store。 */
export function findConnectionByRef(records: ConnectionRefRecord[], ref: string): RefLookupOutcome {
  const text = typeof ref === 'string' ? ref.trim() : ''
  if (!text) return { none: true }
  const refLower = text.toLowerCase()
  const rparts = refTokens(text)
  if (rparts.length === 0) return { none: true }

  let best = 0
  const winners: ConnectionRefMatch[] = []
  for (const record of records) {
    const hit = bestTier(record, refLower, rparts)
    if (!hit) continue
    if (hit.tier > best) {
      best = hit.tier
      winners.length = 0
      winners.push({ record, via: hit.via, alias: text })
    } else if (hit.tier === best) {
      winners.push({ record, via: hit.via, alias: text })
    }
  }
  if (winners.length === 0) return { none: true }
  if (winners.length === 1) return { found: winners[0] }
  const unique = new Map<string, ConnectionRefMatch>()
  for (const winner of winners) unique.set(winner.record.id, winner)
  const list = [...unique.values()]
  if (list.length === 1) return { found: list[0] }
  const sorted = list
    .map((entry) => entry.record)
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  return { ambiguous: sorted }
}

/** 该连接可以被口语引用的别名清单（用于提示与目录展示），首个恒为连接名。 */
export function connectionAliases(record: ConnectionRefRecord): string[] {
  const out: string[] = []
  const push = (value: string): void => {
    const v = value.trim()
    if (v && !out.some((item) => item.toLowerCase() === v.toLowerCase())) out.push(v)
  }
  push(record.name)
  const hostTokens = splitTokens(record.host)
  if (hostTokens.length > 1) {
    // IPv4 / 域名主机：给“末两段”与“末段”（如 48.36、36）。单字符段太弱（易误指），不作为推荐别名。
    const last = hostTokens[hostTokens.length - 1]
    if (last && last.length >= 2) push(last)
    const lastTwo = hostTokens.slice(-2).join('.')
    if (lastTwo.length >= 3) push(lastTwo)
  }
  return out.slice(0, 4)
}
