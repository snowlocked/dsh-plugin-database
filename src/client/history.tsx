/**
 * dsh-database-console 查询历史（纯客户端能力，存浏览器 localStorage）：
 *   - 以连接为单位保留最近 50 条执行记录：SQL 语句（⌨️ SQL 查询页）与
 *     自然语言问题（💬 自然语言查询页，附带当时生成的 SQL）；
 *   - 两个子页共享同一份历史，点击条目即载入到对应输入框；
 *   - 只存文本与时间、目标库等元信息，不存查询结果；
 *   - localStorage 不可用（隐私模式/写超限）时静默忽略写失败，
 *     本次会话内历史仍可用（内存态），刷新后丢失，不影响其它功能。
 */
import { useCallback, useEffect, useState } from 'react'

export type HistoryKind = 'sql' | 'nl'

export interface HistoryEntry {
  id: string
  kind: HistoryKind
  /** SQL 语句或自然语言问题 */
  text: string
  /** NL 条目附带的生成 SQL（如有） */
  sql?: string
  /** 执行时的目标库（'' = 连接默认库） */
  database: string
  /** 记录时间（epoch ms） */
  time: number
}

/** 每个连接保留的最大条数 */
export const HISTORY_LIMIT = 50

const KEY = 'dsh-database-console.history.v1'
/** 单条文本上限，避免超长 SQL 撑爆 localStorage */
const MAX_TEXT = 20_000

type HistoryMap = Record<string, HistoryEntry[]>

function makeId(): string {
  return `h-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function asText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null
}

/** 读取 + 逐条校验 + 截断；损坏的数据整段丢弃（等效于清空）。 */
function loadMap(): HistoryMap {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const map: HistoryMap = {}
    for (const [connId, list] of Object.entries(parsed as Record<string, unknown>)) {
      if (!connId || !Array.isArray(list)) continue
      const entries: HistoryEntry[] = []
      for (const rawEntry of list) {
        if (!rawEntry || typeof rawEntry !== 'object') continue
        const record = rawEntry as Record<string, unknown>
        const id = asText(record.id)
        const text = asText(record.text)
        const kind = record.kind === 'sql' || record.kind === 'nl' ? record.kind : null
        if (!id || !text || !kind) continue
        const sql = asText(record.sql)
        entries.push({
          id,
          kind,
          text: text.slice(0, MAX_TEXT),
          ...(sql ? { sql: sql.slice(0, MAX_TEXT) } : {}),
          database: typeof record.database === 'string' ? record.database : '',
          time: typeof record.time === 'number' && Number.isFinite(record.time) ? record.time : 0,
        })
        if (entries.length >= HISTORY_LIMIT) break
      }
      if (entries.length > 0) map[connId] = entries
    }
    return map
  } catch {
    return {}
  }
}

function saveMap(map: HistoryMap): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map))
  } catch {
    /* 写失败静默：内存态仍可用 */
  }
}

export interface HistoryInput {
  kind: HistoryKind
  text: string
  /** NL 条目附带生成的 SQL */
  sql?: string
  /** 执行时的目标库（'' = 连接默认库） */
  database?: string
}

/**
 * 某个连接的查询历史。
 * record = 追加一条（相同 内容+类型+目标库 自动去重并置顶，超限淘汰最旧）；
 * remove / clear = 删除单条 / 清空；均同步写回 localStorage。
 */
export function useQueryHistory(connectionId: string) {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => loadMap()[connectionId] ?? [])

  // 连接变化时重读（防御：子页理论上跟随固定连接，这里兜底）
  useEffect(() => {
    setEntries(loadMap()[connectionId] ?? [])
  }, [connectionId])

  const persist = useCallback((next: HistoryEntry[]): void => {
    const map = loadMap()
    if (next.length > 0) map[connectionId] = next
    else delete map[connectionId]
    saveMap(map)
  }, [connectionId])

  const record = useCallback((input: HistoryInput): void => {
    const text = input.text.trim().slice(0, MAX_TEXT)
    if (!text) return
    const database = input.database ?? ''
    const existingIndex = entries.findIndex((entry) =>
      entry.kind === input.kind && entry.text === text && entry.database === database)
    const entry: HistoryEntry = {
      id: existingIndex >= 0 ? entries[existingIndex].id : makeId(),
      kind: input.kind,
      text,
      ...(input.sql && input.sql.trim() !== '' ? { sql: input.sql.trim().slice(0, MAX_TEXT) } : {}),
      database,
      time: Date.now(),
    }
    const next = [entry, ...entries.filter((_, index) => index !== existingIndex)].slice(0, HISTORY_LIMIT)
    setEntries(next)
    persist(next)
  }, [entries, persist])

  const remove = useCallback((id: string): void => {
    const next = entries.filter((entry) => entry.id !== id)
    setEntries(next)
    persist(next)
  }, [entries, persist])

  const clear = useCallback((): void => {
    setEntries([])
    persist([])
  }, [persist])

  return { entries, record, remove, clear }
}

function formatHistoryTime(time: number): string {
  if (!time) return ''
  const date = new Date(time)
  const pad = (value: number): string => String(value).padStart(2, '0')
  const hm = `${pad(date.getHours())}:${pad(date.getMinutes())}`
  const now = new Date()
  const sameDay = date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate()
  if (sameDay) return hm
  const md = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  return date.getFullYear() === now.getFullYear() ? `${md} ${hm}` : `${date.getFullYear()}-${md} ${hm}`
}

const KIND_LABEL: Record<HistoryKind, string> = { sql: 'SQL', nl: 'NL' }

/** 可折叠的查询历史面板：点击条目载入、单条删除、一键清空。无历史时不渲染。 */
export function QueryHistorySection({
  entries,
  onLoad,
  onDelete,
  onClear,
}: {
  entries: HistoryEntry[]
  onLoad: (entry: HistoryEntry) => void
  onDelete: (id: string) => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  if (entries.length === 0) return null
  return (
    <div className="db-history">
      <button
        type="button"
        className="db-history-toggle"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        title="最近执行过的 SQL / 自然语言查询（点击条目载入）"
      >
        <span>{open ? '▾' : '▸'} 🕘 查询历史（{entries.length}/{HISTORY_LIMIT}）</span>
        <span className="db-muted">{open ? '点击条目载入' : ''}</span>
      </button>
      {open && (
        <div className="db-history-list">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="db-history-item"
              role="button"
              tabIndex={0}
              onClick={() => onLoad(entry)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onLoad(entry)
                }
              }}
            >
              <span
                className={entry.kind === 'sql' ? 'db-badge db-badge-type' : 'db-badge'}
                style={{ flex: '0 0 auto' }}
                title={entry.kind === 'sql' ? 'SQL 查询' : '自然语言查询'}
              >{KIND_LABEL[entry.kind]}</span>
              <span className="db-history-text" title={entry.sql ? `${entry.text}\n→ ${entry.sql}` : entry.text}>
                {entry.text}
              </span>
              <span className="db-history-time">{formatHistoryTime(entry.time)}</span>
              <button
                type="button"
                className="db-history-del"
                title="删除该条"
                onClick={(event) => { event.stopPropagation(); onDelete(entry.id) }}
              >×</button>
            </div>
          ))}
          <div className="db-history-foot">
            <span>点击条目载入到输入框 · 相同内容自动去重置顶</span>
            <div className="db-grow" />
            <button type="button" onClick={onClear}>清空历史</button>
          </div>
        </div>
      )}
    </div>
  )
}
