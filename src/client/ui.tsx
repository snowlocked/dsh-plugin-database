/**
 * dsh-database-console 客户端通用 UI 小件：
 * 横幅 / 错误文本 / 可拖列宽网格 / 单元格编辑侧栏 / 结果表（分页+排序+过滤）。
 * 从原 App.tsx 拆出，供各工作区面板复用（不依赖其它组件文件）。
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { ApiError, cellText, dbApi } from './client.ts'
import type { ColumnEntry, ConnectionView, QueryResult, TableEntry } from './client.ts'

/* ------------------------------------------------------------------ 通用小件 */

export function Banner({ kind, text }: { kind: 'error' | 'info' | 'ok'; text: string }) {
  if (!text) return null
  return <div className={`db-banner db-banner-${kind}`}>{text}</div>
}

export function ResultFooter({ result }: { result: QueryResult | null }) {
  if (!result) return null
  const parts = [`耗时 ${result.durationMs}ms`]
  if (result.rowCount > 0 || result.columns.length > 0) parts.push(`${result.rowCount} 行`)
  if (result.affectedRows !== undefined) parts.push(`影响 ${result.affectedRows} 行`)
  if (result.truncated) parts.push(`⚠️ 已截断（仅显示 ${result.rows.length} 行）`)
  return (
    <div className="db-row db-muted" style={{ padding: '6px 2px' }}>
      <span className={result.kind === 'change' ? 'db-ok' : ''}>{parts.join(' · ')}</span>
      {result.message ? <span className="db-ok">{result.message}</span> : null}
    </div>
  )
}

export async function errText(reason: unknown): Promise<string> {
  if (reason instanceof ApiError) return reason.message
  return reason instanceof Error ? reason.message : String(reason)
}

/* ------------------------------------------------------------------ 可拖列宽网格 */

export type BrowseSort = { col: number; dir: 1 | -1 }

function estimateColumnWidth(name: string): number {
  const width = (name.length + 6) * 8 + 40
  return Math.min(420, Math.max(120, width))
}

/**
 * 可拖动列宽的数据表：单行展示 + 原生 title + 单元格点击。
 * 容器负责横向/纵向滚动（sticky 表头）。
 */
export interface GridInteraction {
  sort: BrowseSort | null
  onSort: (col: number) => void
  filters: Record<number, string>
  onFilter: (col: number, value: string) => void
  filterOpen: number | null
  onFilterOpen: (col: number | null) => void
}

export function ResizableTableGrid({
  columns,
  rows,
  active,
  onCellClick,
  interaction,
}: {
  columns: string[]
  rows: unknown[][]
  active: { row: number; col: number } | null
  onCellClick: (row: number, col: number) => void
  interaction?: GridInteraction
}) {
  const [widths, setWidths] = useState<Record<number, number>>({})
  const headRef = useRef<HTMLDivElement>(null)

  const clampWidth = (value: number): number => Math.min(720, Math.max(72, Math.round(value)))
  const widthOf = (index: number): number => widths[index] ?? estimateColumnWidth(columns[index] ?? '')
  const totalWidth = columns.reduce((sum, _column, index) => sum + widthOf(index), 0)

  const beginResize = (index: number, event: ReactPointerEvent<HTMLSpanElement>): void => {
    event.preventDefault()
    event.stopPropagation()
    const startX = event.clientX
    const startWidth = widthOf(index)
    const onMove = (move: PointerEvent): void => {
      const next = clampWidth(startWidth + (move.clientX - startX))
      setWidths((previous) => (previous[index] === next ? previous : { ...previous, [index]: next }))
    }
    const onUp = (): void => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const colgroup = (): JSX.Element => (
    <colgroup>
      {columns.map((column, index) => <col key={`col-${index}`} style={{ width: widthOf(index) }} />)}
    </colgroup>
  )

  return (
    <>
      {/* 表头：固定在外层（不参与竖向滚动），横向滚动跟随表体 */}
      <div className="db-gridx-head" ref={headRef}>
        <table className="db-gridx-t" style={{ width: totalWidth }}>
          {colgroup()}
          <thead>
            <tr>
              {columns.map((column, index) => {
                const sorted = interaction && interaction.sort?.col === index ? interaction.sort.dir : 0
                const filtering = interaction ? Boolean(interaction.filters[index]) : false
                return (
                  <th key={column} title={column} style={{ width: widthOf(index), minWidth: widthOf(index) }}>
                    <span className="db-gridx-th-main">
                      {interaction ? (
                        <button
                          className="db-sort-label"
                          title="点击排序：升序 → 降序 → 取消"
                          onClick={() => interaction.onSort(index)}
                        >
                          {column}
                          <span className={sorted === 0 ? 'db-sort-idle' : 'db-sort-on'}>
                            {sorted === 1 ? ' ▲' : sorted === -1 ? ' ▼' : ' ↕'}
                          </span>
                        </button>
                      ) : <span className="db-gridx-th">{column}</span>}
                      {interaction ? (
                        <span
                          className={filtering ? 'db-filter-toggle db-filter-on' : 'db-filter-toggle'}
                          title={filtering ? `过滤：${interaction.filters[index]}（点击编辑）` : '列过滤'}
                          onClick={() => interaction.onFilterOpen(interaction.filterOpen === index ? null : index)}
                        >
                          {filtering ? '✕' : '⚲'}
                        </span>
                      ) : null}
                    </span>
                    {interaction && interaction.filterOpen === index ? (
                      <input
                        className="db-gridx-filter"
                        autoFocus
                        value={interaction.filters[index] ?? ''}
                        placeholder={`过滤 ${column}…`}
                        spellCheck={false}
                        onChange={(e) => interaction.onFilter(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape' || e.key === 'Enter') interaction.onFilterOpen(null)
                        }}
                      />
                    ) : null}
                    <span className="db-colresize" onPointerDown={(e) => beginResize(index, e)} title="拖动调整列宽" />
                  </th>
                )
              })}
            </tr>
          </thead>
        </table>
      </div>
      {/* 表体：独立竖向/横向滚动；与表头共用同一组列宽 */}
      <div
        className="db-gridx-body"
        onScroll={(event) => {
          if (headRef.current) headRef.current.scrollLeft = event.currentTarget.scrollLeft
        }}
      >
        <table className="db-gridx-t" style={{ width: totalWidth }}>
          {colgroup()}
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => {
                  const text = cellText(cell)
                  const selected = active?.row === rowIndex && active?.col === colIndex
                  return (
                    <td
                      key={`${rowIndex}-${colIndex}`}
                      className={selected ? 'db-cell-active' : 'db-cell'}
                      title={text}
                      style={{ width: widthOf(colIndex) }}
                      onClick={() => onCellClick(rowIndex, colIndex)}
                    >
                      {cell === null || cell === undefined
                        ? <span className="db-null">NULL</span>
                        : typeof cell === 'object'
                          ? <span className="db-mono">{text}</span>
                          : text}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

/** 单元格编辑侧栏：显示整行上下文，可改值 / 存 NULL，保存后写库。 */
export function CellDetailEditor({
  connection,
  table,
  schema,
  database,
  tableName,
  queryColumns,
  metaColumns,
  row,
  colIndex,
  onClose,
  onSaved,
  onMessage,
}: {
  connection: ConnectionView
  table: TableEntry | null
  schema: string | undefined
  database?: string
  tableName: string
  queryColumns: string[]
  metaColumns: ColumnEntry[]
  row: unknown[]
  colIndex: number
  onClose: () => void
  onSaved: () => void
  onMessage: (text: string, kind: 'ok' | 'error') => void
}) {
  const column = queryColumns[colIndex] ?? ''
  const value = row[colIndex]
  const meta = metaColumns.find((entry) => entry.name === column)
  const [text, setText] = useState(() => (value === null || value === undefined ? '' : cellText(value)))
  const [asNull, setAsNull] = useState(value === null || value === undefined)
  const [busy, setBusy] = useState('')
  // 整行数据默认收起，点击展开
  const [showRow, setShowRow] = useState(false)

  const columnIndexByName = new Map<string, number>()
  queryColumns.forEach((name, index) => columnIndexByName.set(name, index))
  const pk = metaColumns
    .filter((entry) => entry.primary)
    .map((entry) => ({ column: entry.name, value: row[columnIndexByName.get(entry.name) ?? -1] ?? null }))
    .filter((entry) => columnIndexByName.has(entry.column))
  const pkText = pk.length > 0 ? pk.map((entry) => `${entry.column}=${cellText(entry.value)}`).join(' & ') : ''

  const canSave = pk.length > 0
  const isMongo = connection.type === 'mongodb'

  const save = async (): Promise<void> => {
    if (!canSave || !table) return
    setBusy('保存中…')
    try {
      const result = await dbApi.cellUpdate({
        id: connection.id,
        table: table.name,
        schema,
        ...(database ? { database } : {}),
        column,
        pk,
        value: asNull ? null : text,
        isNull: asNull,
      })
      if (result.ok) {
        onMessage(`✓ 已更新 ${result.affectedRows} 行（${tableName}.${column}）`, 'ok')
        onSaved()
      }
    } catch (reason) {
      onMessage(await errText(reason), 'error')
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="db-celldetail">
      <div className="db-celldetail-title">
        <span>✏️ 单元格编辑</span>
        <button className="db-btn-ghost" onClick={onClose} disabled={busy !== ''}>✕</button>
      </div>
      <div className="db-celldetail-meta">
        <div><span className="db-muted">表</span> {tableName}</div>
        <div><span className="db-muted">列</span> {column} <span className="db-badge db-badge-type">{meta?.type ?? ''}</span></div>
        <div><span className="db-muted">定位</span> {pkText || '（无主键）'}</div>
      </div>
      <button
        className="db-row db-row-toggle"
        onClick={() => setShowRow((previous) => !previous)}
        title={showRow ? '点击收起整行数据' : '点击展开整行数据'}
      >
        <span>{showRow ? '▾' : '▸'} 整行数据（{queryColumns.length} 列）</span>
      </button>
      {showRow && (
        <div className="db-celldetail-row">
          {queryColumns.map((name, index) => (
            <div key={name} title={`${name} = ${cellText(row[index])}`}>
              <span className="db-chip">{name}</span> = {cellText(row[index])}
            </div>
          ))}
        </div>
      )}
      {isMongo || !canSave ? (
        <div className="db-empty" style={{ padding: '8px' }}>
          {isMongo
            ? 'MongoDB 集合暂不支持单元格编辑（没有主键列概念）'
            : '该表没有主键，无法安全定位行，编辑已禁用'}
        </div>
      ) : null}
      <label className="db-muted" style={{ display: 'block', margin: '8px 0 4px' }}>新值（存为 NULL 可留空）：</label>
      <label className="db-row" style={{ gap: 6, cursor: 'pointer', fontSize: 12 }}>
        <input type="checkbox" checked={asNull} onChange={(e) => setAsNull(e.target.checked)} /> 存为 NULL
      </label>
      <textarea
        className="db-code"
        style={{ minHeight: 90, width: '100%', boxSizing: 'border-box', marginTop: 6 }}
        value={text}
        disabled={asNull}
        spellCheck={false}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入新值…"
      />
      <div className="db-row" style={{ gap: 8, marginTop: 8 }}>
        <button className="db-btn-primary" onClick={save} disabled={!canSave || busy !== '' || isMongo}>
          {busy || (canSave ? '保存（UPDATE 该行）' : '保存')}
        </button>
        <span className="db-muted" style={{ fontSize: 11 }}>点击单元格旁的任意处可再选其它单元格</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ 结果表 */

/** 单元格值比较：null 排最后；数字按数值；否则按文本（数字文本自动按数值）。 */
function compareCell(a: unknown, b: unknown): number {
  if (a === null || a === undefined) return b === null || b === undefined ? 0 : 1
  if (b === null || b === undefined) return -1
  if (typeof a === 'number' && typeof b === 'number') return a < b ? -1 : a > b ? 1 : 0
  const ta = cellText(a)
  const tb = cellText(b)
  const na = Number(ta)
  const nb = Number(tb)
  if (ta !== '' && tb !== '' && Number.isFinite(na) && Number.isFinite(nb)) return na < nb ? -1 : na > nb ? 1 : 0
  return ta.localeCompare(tb, undefined, { numeric: true, sensitivity: 'base' })
}

/**
 * SQL 控制台 / AI 查询的通用结果表：
 * 复用可拖列宽双表网格 + 表头点击排序 + 列过滤 + 分页/每页数量（数据全量在内存，分页在客户端）。
 */
export function ResultTableView({
  result,
  limit,
  onLimitChange,
}: {
  result: QueryResult | null
  /** 本次执行取回的行数上限（也是客户端每页切片大小） */
  limit: number
  onLimitChange: (next: number) => void
}) {
  const [page, setPage] = useState(0)
  const pageSize = Math.max(1, limit)
  const [sort, setSort] = useState<BrowseSort | null>(null)
  const [filters, setFilters] = useState<Record<number, string>>({})
  const [filterOpen, setFilterOpen] = useState<number | null>(null)

  const columns = result?.columns ?? []
  const rawRows = result?.rows ?? []

  // 新结果到达时重置排序/过滤/分页
  useEffect(() => {
    setPage(0)
    setSort(null)
    setFilters({})
    setFilterOpen(null)
  }, [result])

  const filteredRows = useMemo(() => {
    const entries = Object.entries(filters).filter((entry) => entry[1].trim() !== '')
    if (entries.length === 0) return rawRows
    return rawRows.filter((row) =>
      entries.every(([colIndexText, query]) => {
        const colIndex = Number(colIndexText)
        const value = cellText(row[colIndex]).toLowerCase()
        return value.includes(query.trim().toLowerCase())
      }),
    )
  }, [rawRows, filters])

  const sortedRows = useMemo(() => {
    if (!sort) return filteredRows
    const col = sort.col
    const dir = sort.dir
    return [...filteredRows].sort((a, b) => compareCell(a[col], b[col]) * dir)
  }, [filteredRows, sort])

  const total = rawRows.length
  const matched = sortedRows.length
  const pageCount = Math.max(1, Math.ceil(matched / pageSize))

  useEffect(() => {
    setPage((previous) => Math.min(previous, pageCount - 1))
  }, [pageCount])

  const pageRows = sortedRows.slice(page * pageSize, (page + 1) * pageSize)

  if (!result || result.columns.length === 0) {
    return (
      <div>
        <div className="db-empty">
          {result?.kind === 'change'
            ? (result.message ?? `已执行（影响 ${result.affectedRows ?? 0} 行）`)
            : (result?.message ?? '执行后结果显示在这里（结果最多显示 10000 行）')}
        </div>
        {result ? <ResultFooter result={result} /> : null}
      </div>
    )
  }

  const onSort = (col: number): void => {
    const current = sort?.col === col ? sort.dir : 0
    if (current === 1) {
      setSort({ col, dir: -1 })
    } else if (current === -1) {
      setSort(null)
    } else {
      setSort({ col, dir: 1 })
    }
  }

  return (
    <div>
      <ResultFooter result={result} />
      <ResizableTableGrid
        columns={columns}
        rows={pageRows}
        active={null}
        onCellClick={() => undefined}
        interaction={{
          sort,
          onSort,
          filters,
          onFilter: (col, value) => {
            setFilters((previous) => ({ ...previous, [col]: value }))
          },
          filterOpen,
          onFilterOpen: (col) => setFilterOpen(col),
        }}
      />
      {pageRows.length === 0 ? (
        <div className="db-empty">（没有匹配的行）</div>
      ) : null}
      <div className="db-row" style={{ marginTop: 6, gap: 8 }}>
        <button disabled={page <= 0} onClick={() => setPage((previous) => Math.max(0, previous - 1))}>← 上一页</button>
        <button disabled={page >= pageCount - 1} onClick={() => setPage((previous) => Math.min(pageCount - 1, previous + 1))}>下一页 →</button>
        <span className="db-muted">
          第 {page + 1}/{pageCount} 页 · 共 {matched} 行{matched !== total ? `（已取回 ${total} 行）` : ''}
        </span>
        <span className="db-muted">每页/最多取</span>
        <select
          value={pageSize}
          title="每页行数 = 本次执行最多取回的行数；调大后请重新执行以取更多数据"
          onChange={(e) => { onLimitChange(Number(e.target.value)); setPage(0) }}
        >
          {[200, 500, 1000, 5000].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    </div>
  )
}
