/** SQL 文本处理：注释/字符串感知的语句切分、只读语句判定、标识符引号。 */

/** 去除 SQL 中的行注释与块注释（保守实现：忽略引号内内容时保持近似正确即可）。 */
export function stripSqlComments(sql: string): string {
  let out = ''
  let i = 0
  let quote: string | null = null
  let lineComment = false
  let blockComment = false
  while (i < sql.length) {
    const c = sql[i]
    const next = sql[i + 1]
    if (lineComment) {
      if (c === '\n') { lineComment = false; out += '\n' }
      i += 1
      continue
    }
    if (blockComment) {
      if (c === '*' && next === '/') { blockComment = false; i += 2; continue }
      if (c === '\n') out += '\n'
      i += 1
      continue
    }
    if (quote) {
      out += c
      if (c === quote) {
        // 处理双写转义 'xxx''yyy'
        if (next === quote) { out += next; i += 1 }
        else quote = null
      }
      i += 1
      continue
    }
    if (c === "'" || c === '"' || c === '`') { quote = c; out += c; i += 1; continue }
    if (c === '-' && next === '-') { lineComment = true; i += 2; continue }
    if (c === '/' && next === '*') { blockComment = true; i += 2; continue }
    out += c
    i += 1
  }
  return out
}

/** 去注释 + 按分号切分（分号不出现在引号内，字符串已简化处理）。 */
export function splitStatements(sql: string): string[] {
  const cleaned = stripSqlComments(sql)
  const parts: string[] = []
  let current = ''
  let quote: string | null = null
  for (let i = 0; i < cleaned.length; i += 1) {
    const c = cleaned[i]
    if (quote) {
      current += c
      if (c === quote) {
        if (cleaned[i + 1] === quote) { current += cleaned[i + 1]; i += 1 }
        else quote = null
      }
      continue
    }
    if (c === "'" || c === '"' || c === '`') { quote = c; current += c; continue }
    if (c === ';') {
      if (current.trim()) parts.push(current.trim())
      current = ''
      continue
    }
    current += c
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

/** 提取语句的第一个关键字（大写）。 */
export function firstKeyword(sql: string): string {
  const cleaned = stripSqlComments(sql).trim()
  const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)/u.exec(cleaned)
  return match ? match[1].toUpperCase() : ''
}

/** 视为只读的语句头。 */
const READ_ONLY_PREFIXES = new Set([
  'SELECT', 'WITH', 'SHOW', 'DESCRIBE', 'DESC', 'EXPLAIN', 'PRAGMA',
  'VALUES',
])

/** 是否只读语句（用于“只读模式”下拦截 DML/DDL）。 */
export function isReadOnlyStatement(sql: string): boolean {
  const keyword = firstKeyword(sql)
  return READ_ONLY_PREFIXES.has(keyword)
}

/** 非空且为单条语句（用于只读模式与 AI 自动执行）。 */
export function singleStatement(sql: string): string {
  const parts = splitStatements(sql)
  if (parts.length === 0) return ''
  if (parts.length > 1) {
    throw new Error('只读/自动执行模式仅允许单条 SQL 语句（请去掉多余分号或拆开执行）')
  }
  return parts[0] ?? ''
}

/** 是否纯标识符（目录查询内联白名单，避免注入）。 */
export function isSafeIdentifier(value: string): boolean {
  return /^[A-Za-z0-9_$#.\u4e00-\u9fa5]{1,128}$/u.test(value)
}

export function quotePg(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`
}

export function quoteMySql(identifier: string): string {
  return `\`${identifier.replace(/`/g, '``')}\``
}

export function quoteSqlite(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`
}

/** 把前端传的可选 schema 规范化（去空串）。 */
export function normalizeSchema(schema: string | null | undefined): string | undefined {
  const value = schema?.trim()
  return value && value.length > 0 ? value : undefined
}

/** 数组扁平化去重工具。 */
export function unique(values: string[]): string[] {
  return [...new Set(values)]
}

/**
 * 对“最外层是 SELECT/WITH 且未自带 LIMIT”的只读语句追加行数上限，
 * 让数据库只返回需要的行数，避免全量取回后再截断（大表慢、占内存）。
 * 已自带 LIMIT 的语句信任用户的写法，不追加。
 */
export function capReadSelect(sql: string, cap: number): { sql: string; capped: boolean } {
  const trimmed = sql.trim().replace(/;\s*$/u, '')
  if (!/^(select|with)\b/iu.test(trimmed)) return { sql, capped: false }
  if (/\blimit\b/iu.test(trimmed)) return { sql, capped: false }
  const safeCap = Math.max(1, Math.min(Math.trunc(cap) || 1, 1_000_000))
  // 剥掉尾部的行注释/块注释结尾，避免把追加的 limit 注释掉
  const clean = trimmed.replace(/--[^\n]*$/u, '').replace(/\/\*[\s\S]*\*\/\s*$/u, '').replace(/\s+$/u, '')
  if (clean.length === 0) return { sql, capped: false }
  return { sql: `${clean}\nlimit ${safeCap}`, capped: true }
}

/** LIKE 通配符转义（配合 SQL 侧 `escape '\'`），让用户输入按字面匹配。 */
export function escapeLike(value: string): string {
  return value.replace(/[\%_]/g, '\$&')
}
