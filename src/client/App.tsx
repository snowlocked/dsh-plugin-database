import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import {
  ApiError,
  dbApi,
  TYPE_LABELS,
  isSchemaAware,
  defaultPort,
  cellText,
} from './client.ts'
import type {
  AiModelsResult,
  AiRunResult,
  ColumnEntry,
  ConnectionInput,
  ConnectionView,
  DbType,
  GenerateResult,
  QueryResult,
  SchemaEntry,
  TableEntry,
} from './client.ts'

/* ------------------------------------------------------------------ 通用小件 */

function Banner({ kind, text }: { kind: 'error' | 'info' | 'ok'; text: string }) {
  if (!text) return null
  return <div className={`db-banner db-banner-${kind}`}>{text}</div>
}

function DataGrid({ result, emptyText }: { result: QueryResult | null; emptyText: string }) {
  if (!result) return <div className="db-empty">{emptyText}</div>
  if (result.columns.length === 0) {
    return (
      <div className="db-empty">
        {result.message ?? '（无返回内容）'}
        {typeof result.affectedRows === 'number' ? ` 影响行数：${result.affectedRows}` : ''}
      </div>
    )
  }
  return (
    <div className="db-scroll">
      <table className="db-data">
        <thead>
          <tr>{result.columns.map((column) => <th key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {result.rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => {
                const value = cellText(cell)
                const isNull = cell === null || cell === undefined
                return (
                  <td key={cellIndex}>
                    {isNull ? <span className="db-null">NULL</span>
                      : typeof cell === 'object' ? <span className="db-mono">{value}</span>
                        : value}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ResultFooter({ result }: { result: QueryResult | null }) {
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

async function errText(reason: unknown): Promise<string> {
  if (reason instanceof ApiError) return reason.message
  return reason instanceof Error ? reason.message : String(reason)
}

/* ------------------------------------------------------------------ 连接管理 */

const TYPE_OPTIONS: DbType[] = ['postgresql', 'mysql', 'mongodb', 'sqlite', 'dameng']

interface Draft extends ConnectionInput { open: boolean; isNew: boolean; hasPassword?: boolean }

function emptyDraft(): ConnectionInput {
  return { name: '', type: 'postgresql' }
}

function ConnectionEditor({
  draft,
  onClose,
  onSaved,
  onChanged,
}: {
  draft: Draft
  onClose(): void
  onSaved(view: ConnectionView): void
  onChanged(): void
}) {
  const [form, setForm] = useState<ConnectionInput>({ ...draft })
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const meta = useMemo(() => {
    const label = TYPE_LABELS[form.type]
    const needsHost = form.type !== 'sqlite'
    const needsDatabase = form.type === 'mysql' || form.type === 'mongodb'
    const needsSchema = form.type === 'dameng'
    return { label, needsHost, needsDatabase, needsSchema, needFile: form.type === 'sqlite' }
  }, [form.type])

  const patch = (partial: Partial<ConnectionInput>): void => {
    setForm((previous) => ({ ...previous, ...partial }))
    setOk('')
    setError('')
  }

  const buildPayload = (): ConnectionInput => {
    const payload: ConnectionInput = {
      id: form.id,
      name: form.name.trim(),
      type: form.type,
      host: form.host?.trim() || undefined,
      user: form.user?.trim() || undefined,
      database: form.database?.trim() || undefined,
      schema: form.schema?.trim() || undefined,
      file: form.file?.trim() || undefined,
      authSource: form.authSource?.trim() || undefined,
      ssl: form.ssl === true,
      options: form.options && Object.keys(form.options).length > 0 ? form.options : undefined,
    }
    if (form.type === 'sqlite') { delete payload.host; delete payload.port; delete payload.database }
    if (form.port !== undefined && Number.isFinite(Number(form.port))) payload.port = Number(form.port)
    if (form.dmCompat) payload.dmCompat = form.dmCompat
    payload.dmNoEncrypt = form.dmNoEncrypt === true
    if (form.password !== undefined && form.password !== '') payload.password = form.password
    // 不再保存连接级 AI 配置：AI 复用 DSH 自身配置的模型，界面按需选择
    return payload
  }

  const handleTest = async (): Promise<void> => {
    setTesting(true)
    setError('')
    setOk('')
    try {
      const result = await dbApi.test(buildPayload())
      setOk(result.ok ? `✅ 连接成功（${result.latencyMs}ms）` : `❌ ${result.message}`)
      if (!result.ok) setError(result.detail ?? result.message)
    } catch (reason) {
      setError(await errText(reason))
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async (): Promise<void> => {
    if (!form.name.trim()) { setError('请填写连接名称'); return }
    if (meta.needsHost && !form.host?.trim()) { setError('请填写主机地址'); return }
    if (meta.needsDatabase && !form.database?.trim()) { setError(`请填写 ${TYPE_LABELS[form.type]} 的数据库名`); return }
    if (meta.needFile && !form.file?.trim()) { setError('请填写 SQLite 数据库文件路径'); return }
    setSaving(true)
    setError('')
    try {
      const { connection } = await dbApi.save(buildPayload())
      setOk('已保存')
      onChanged()
      onSaved(connection)
    } catch (reason) {
      setError(await errText(reason))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="db-card" style={{ margin: '4px 0 12px', borderColor: 'var(--db-accent)' }}>
      <div className="db-card-title"><span>✏️ 编辑连接（{draft.isNew ? '新建' : form.id}）</span>
        <button className="db-btn-ghost" onClick={onClose}>收起</button>
      </div>
      <div className="db-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))' }}>
        <div className="db-field">
          <label>名称 *</label>
          <input value={form.name ?? ''} onChange={(e) => patch({ name: e.target.value })} placeholder="例如：生产库-PG" />
        </div>
        <div className="db-field">
          <label>类型</label>
          <select value={form.type} onChange={(e) => patch({ type: e.target.value as DbType })}>
            {TYPE_OPTIONS.map((type) => <option key={type} value={type}>{TYPE_LABELS[type]}</option>)}
          </select>
        </div>
        {meta.needsHost && (
          <>
            <div className="db-field">
              <label>主机</label>
              <input value={form.host ?? ''} onChange={(e) => patch({ host: e.target.value })} placeholder={meta.label === 'MongoDB' ? '127.0.0.1 或 mongodb://…' : '127.0.0.1'} />
            </div>
            <div className="db-field">
              <label>端口</label>
              <input type="number" value={form.port ?? defaultPort(form.type) ?? ''}
                onChange={(e) => patch({ port: e.target.value === '' ? undefined : Number(e.target.value) })} />
            </div>
          </>
        )}
        <div className="db-field">
          <label>用户名</label>
          <input value={form.user ?? ''} onChange={(e) => patch({ user: e.target.value })} autoComplete="off" />
        </div>
        <div className="db-field">
          <label>密码 {draft.isNew || !draft.hasPassword
            ? ''
            : <span className="db-muted">（已保存，留空即用已存密码；点“测试连接”也用它）</span>}</label>
          <input type="password" value={form.password ?? ''} onChange={(e) => patch({ password: e.target.value })} autoComplete="new-password"
            placeholder={draft.isNew ? '新建连接时填写' : '（已保存，输入可覆盖）'} />
        </div>
        {meta.needFile && (
          <div className="db-field" style={{ gridColumn: '1 / -1' }}>
            <label>数据库文件路径 *</label>
            <input value={form.file ?? ''} onChange={(e) => patch({ file: e.target.value })} placeholder="C:\\data\\app.db 或 相对路径" />
          </div>
        )}
        {meta.needsDatabase && (
          <div className="db-field">
            <label>数据库名 *{form.type === 'mongodb' ? '（database）' : ''}</label>
            <input value={form.database ?? ''} onChange={(e) => patch({ database: e.target.value })} />
          </div>
        )}
        {meta.needsSchema && (
          <div className="db-field">
            <label>schema（默认模式，可选）</label>
            <input value={form.schema ?? ''} onChange={(e) => patch({ schema: e.target.value })} placeholder="留空使用登录用户" />
          </div>
        )}
        {form.type === 'dameng' && (
          <div className="db-field">
            <label>兼容模式</label>
            <select value={form.dmCompat ?? 'oracle'} onChange={(e) => patch({ dmCompat: e.target.value as 'oracle' | 'mysql' })}>
              <option value="oracle">Oracle 模式（默认）</option>
              <option value="mysql">MySQL 兼容模式</option>
            </select>
          </div>
        )}
        {form.type === 'dameng' && (
          <label className="db-field" style={{ flexDirection: 'row', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.dmNoEncrypt === true} onChange={(e) => patch({ dmNoEncrypt: e.target.checked })} />
            <span>兼容 OpenSSL3：关闭登录/消息加密（报错 0308010C 消息加密失败时勾选；仅建议可信内网使用）</span>
          </label>
        )}
        {form.type === 'mongodb' && (
          <div className="db-field">
            <label>authSource（可选）</label>
            <input value={form.authSource ?? ''} onChange={(e) => patch({ authSource: e.target.value })} placeholder="admin" />
          </div>
        )}
        {(meta.needsHost || meta.needFile) && (
          <div className="db-field">
            <label>SSL/TLS</label>
            <select value={form.ssl === true ? 'yes' : 'no'} onChange={(e) => patch({ ssl: e.target.value === 'yes' })}>
              <option value="no">关闭</option>
              <option value="yes">启用</option>
            </select>
          </div>
        )}
      </div>

      <Banner kind="error" text={error} />
      <Banner kind={ok.startsWith('✅') ? 'ok' : ok ? 'info' : 'info'} text={ok} />
      <div className="db-row" style={{ marginTop: 8 }}>
        <button className="db-btn-primary" onClick={handleSave} disabled={saving}>{saving ? '保存中…' : '保存连接'}</button>
        <button onClick={handleTest} disabled={testing}>{testing ? '测试中…' : '测试连接'}</button>
        <button className="db-btn-ghost" onClick={onClose}>取消</button>
        <span className="db-muted db-grow">测试连接不会修改已保存的连接。</span>
      </div>
    </div>
  )
}

function ConnectionPanel({
  connections,
  onRefresh,
  onOpen,
}: {
  connections: ConnectionView[]
  onRefresh(): Promise<void>
  onOpen(record: ConnectionView): void
}) {
  const [editor, setEditor] = useState<Draft>({ ...emptyDraft(), open: false, isNew: true })
  const [error, setError] = useState('')

  const edit = (record: ConnectionView | null): void => {
    setEditor(record
      ? {
          id: record.id,
          name: record.name,
          type: record.type,
          host: record.host,
          port: record.port,
          user: record.user,
          database: record.database,
          schema: record.schema,
          ssl: record.ssl,
          file: record.file,
          authSource: record.authSource,
          dmCompat: record.dmCompat,
          dmNoEncrypt: record.dmNoEncrypt,
          options: record.options,
          // AI 不复用连接级配置（跟随 DSH 全局配置，见 AiPanel 模型下拉）
          hasPassword: record.hasPassword,
          open: true,
          isNew: false,
        }
      : { ...emptyDraft(), open: true, isNew: true })
  }

  const handleDelete = async (record: ConnectionView): Promise<void> => {
    if (!window.confirm(`确定删除连接「${record.name}」吗？`)) return
    setError('')
    try {
      const result = await dbApi.remove(record.id)
      if (!result.ok) {
        setError(`删除失败：未找到连接 ${record.id}（可能已被其它页面删除），已刷新列表`)
      }
      await onRefresh()
      setEditor((previous) => ({ ...previous, open: false }))
    } catch (reason) {
      setError(await errText(reason))
    }
  }

  const openEditorFromList = (): void => edit(null)

  return (
    <div className="db-card">
      <div className="db-card-title">
        <span>🔌 连接管理（{connections.length}）</span>
        <div className="db-row">
          <button className="db-btn-primary" onClick={openEditorFromList}>+ 新建连接</button>
          <button onClick={() => onRefresh()}>刷新</button>
        </div>
      </div>
      {editor.open && (
        <ConnectionEditor
          draft={editor}
          onClose={() => setEditor((previous) => ({ ...previous, open: false }))}
          onSaved={() => {
            // 保存成功后：刷新列表并收起编辑框（同一 id 更新，不产生新连接）
            void onRefresh()
            setEditor((previous) => ({ ...previous, open: false }))
          }}
          onChanged={() => onRefresh()}
        />
      )}
      <Banner kind="error" text={error} />
      {connections.length === 0 ? (
        <div className="db-empty">还没有连接。点击「+ 新建连接」添加第一个数据库连接，支持 PostgreSQL / MySQL / MongoDB / SQLite / 达梦。</div>
      ) : (
        <div className="db-list">
          {connections.map((record) => (
            <div key={record.id} className="db-list-item">
              <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                <div className="db-row">
                  <strong>{record.name}</strong>
                  <span className="db-badge db-badge-type">{TYPE_LABELS[record.type]}</span>
                  {record.lastError ? <span className="db-badge" style={{ color: 'var(--db-err)', borderColor: 'rgba(255,95,86,.4)' }}>测试失败</span>
                    : record.lastTestedAt ? <span className="db-badge db-badge-ok">已测试</span> : null}
                  {record.hasPassword ? null : <span className="db-badge">未保存密码</span>}
                </div>
                <div className="db-muted" style={{ fontSize: 12, marginTop: 2 }}>
                  {record.type === 'sqlite'
                    ? <span className="db-chip">{record.file}</span>
                    : <span><span className="db-chip">{record.host ?? ''}{record.port ? `:${record.port}` : ''}</span>
                      {record.user ? ` · ${record.user}` : ''}{record.database ? ` · ${record.database}` : ''}{record.schema ? ` · schema=${record.schema}` : ''}</span>}
                </div>
                {record.lastError && <div className="db-muted" style={{ fontSize: 12, color: 'var(--db-err)' }}>上次测试：{record.lastError}</div>}
              </div>
              <div className="db-row">
                <button onClick={() => onOpen(record)}>打开</button>
                <button onClick={() => edit(record)}>编辑</button>
                <button className="db-btn-danger" onClick={() => handleDelete(record)}>删除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ 数据浏览 */

type BrowseSort = { col: number; dir: 1 | -1 }

/** 把浏览页的列下标排序/过滤状态映射为服务端认识的列名参数（无生效项返回 null）。 */
function browsePreviewOf(
  sort: BrowseSort | null,
  filters: Record<number, string>,
  columns: string[],
): { sort?: { column: string; dir: 'asc' | 'desc' }; filters?: Record<string, string> } | null {
  const out: { sort?: { column: string; dir: 'asc' | 'desc' }; filters?: Record<string, string> } = {}
  if (sort && columns[sort.col]) {
    out.sort = { column: columns[sort.col] ?? '', dir: sort.dir === 1 ? 'asc' : 'desc' }
  }
  const filtersOut: Record<string, string> = {}
  for (const [key, raw] of Object.entries(filters)) {
    const col = columns[Number(key)]
    const value = String(raw ?? '').trim()
    if (!col || !value) continue
    filtersOut[col] = value
  }
  if (Object.keys(filtersOut).length > 0) out.filters = filtersOut
  return Object.keys(out).length > 0 ? out : null
}

function estimateColumnWidth(name: string): number {
  const width = (name.length + 6) * 8 + 40
  return Math.min(420, Math.max(120, width))
}

/**
 * 可拖动列宽的数据表：单行展示 + 原生 title + 单元格点击。
 * 容器负责横向/纵向滚动（sticky 表头）。
 */
interface GridInteraction {
  sort: { col: number; dir: 1 | -1 } | null
  onSort: (col: number) => void
  filters: Record<number, string>
  onFilter: (col: number, value: string) => void
  filterOpen: number | null
  onFilterOpen: (col: number | null) => void
}

function ResizableTableGrid({
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
function CellDetailEditor({
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

function BrowsePanel({ connection, database }: { connection: ConnectionView; database?: string }) {
  const [schemas, setSchemas] = useState<SchemaEntry[]>([])
  const [schema, setSchema] = useState<string | undefined>()
  const [tables, setTables] = useState<TableEntry[]>([])
  const [table, setTable] = useState<TableEntry | null>(null)
  const [columns, setColumns] = useState<ColumnEntry[]>([])
  const [rows, setRows] = useState<QueryResult | null>(null)
  const [offset, setOffset] = useState(0)
  const [limit, setLimit] = useState(200)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const aware = isSchemaAware(connection.type)
  // 字段结构卡片默认折叠
  const [showStructure, setShowStructure] = useState(false)
  // 当前点选的单元格（行/列），空=未选中
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null)
  const [cellMsg, setCellMsg] = useState<{ text: string; kind: 'ok' | 'error' } | null>(null)
  // 整表排序 / 列过滤（列下标，服务端生效）
  const [bSort, setBSort] = useState<BrowseSort | null>(null)
  const [bFilters, setBFilters] = useState<Record<number, string>>({})
  const [bFilterOpen, setBFilterOpen] = useState<number | null>(null)
  const filterTimer = useRef<number | undefined>(undefined)

  const loadTables = useCallback(async (nextSchema?: string) => {
    setBusy('加载表列表…')
    setError('')
    setActiveCell(null)
    setCellMsg(null)
    setBSort(null)
    setBFilters({})
    setBFilterOpen(null)
    if (filterTimer.current !== undefined) { window.clearTimeout(filterTimer.current); filterTimer.current = undefined }
    try {
      const { tables: list } = await dbApi.tables(connection.id, nextSchema, database)
      setTables(list)
      setTable(null)
      setColumns([])
      setRows(null)
    } catch (reason) {
      setError(await errText(reason))
      setTables([])
    } finally {
      setBusy('')
    }
  }, [connection.id, database])

  useEffect(() => {
    let stale = false
    if (!aware) { setSchemas([]); setSchema(undefined); void loadTables(undefined); return undefined }
    setBusy('加载模式列表…')
    dbApi.schemas(connection.id, database).then(({ schemas: list }) => {
      if (stale) return
      setSchemas(list)
      // 切换了数据库时优先选 public / 连接配置的 schema；否则沿用连接配置
      const preferred = database
        ? list.find((entry) => entry.name === 'public')
          ?? list.find((entry) => entry.name === connection.schema)
          ?? list[0]
        : list.find((entry) => entry.name === connection.schema) ?? list[0]
      const next = preferred?.name
      setSchema(next)
      if (next) void loadTables(next)
      else setBusy('')
    }).catch(async (reason) => {
      if (!stale) setError(await errText(reason))
      setBusy('')
    })
    return () => { stale = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection.id, aware, database, loadTables])

  const openTable = async (entry: TableEntry): Promise<void> => {
    setTable(entry)
    setOffset(0)
    setError('')
    setActiveCell(null)
    setCellMsg(null)
    setBSort(null)
    setBFilters({})
    setBFilterOpen(null)
    if (filterTimer.current !== undefined) { window.clearTimeout(filterTimer.current); filterTimer.current = undefined }
    setBusy(`读取「${entry.name}」…`)
    try {
      const [cols, data] = await Promise.all([
        dbApi.columns(connection.id, entry.name, schema, database),
        dbApi.rows(connection.id, entry.name, schema, limit, 0, database),
      ])
      setColumns(cols.columns)
      setRows(data)
    } catch (reason) {
      setError(await errText(reason))
      setColumns([])
      setRows(null)
    } finally {
      setBusy('')
    }
  }

  /** 统一取数：override 传 null=不带排序过滤；传 {sort,filters}=显式；undefined=用当前状态。useLimit 可选覆盖页大小。 */
  const goPage = async (
    nextOffset: number,
    override?: { sort: BrowseSort | null; filters: Record<number, string> } | null,
    useLimit?: number,
  ): Promise<void> => {
    if (!table) return
    if (filterTimer.current !== undefined) { window.clearTimeout(filterTimer.current); filterTimer.current = undefined }
    setBusy('查询中…')
    setError('')
    setActiveCell(null)
    setCellMsg(null)
    try {
      const cols = rows?.columns ?? []
      const sortIn = override === null ? null : (override?.sort !== undefined ? override.sort : bSort)
      const filtersIn = override === null ? {} : (override?.filters !== undefined ? override.filters : bFilters)
      const opts = browsePreviewOf(sortIn, filtersIn, cols)
      const data = await dbApi.rows(connection.id, table.name, schema, useLimit ?? limit, Math.max(0, nextOffset), database, opts)
      setRows(data)
      setOffset(Math.max(0, nextOffset))
    } catch (reason) {
      setError(await errText(reason))
    } finally {
      setBusy('')
    }
  }

  const onSortBrowse = (col: number): void => {
    const current = bSort?.col === col ? bSort.dir : 0
    const next: BrowseSort | null = current === 1 ? { col, dir: -1 } : current === -1 ? null : { col, dir: 1 }
    setBSort(next)
    setBFilterOpen(null)
    void goPage(0, { sort: next, filters: bFilters })
  }

  const onFilterBrowse = (col: number, value: string): void => {
    const next = { ...bFilters, [col]: value }
    setBFilters(next)
    if (filterTimer.current !== undefined) window.clearTimeout(filterTimer.current)
    filterTimer.current = window.setTimeout(() => { void goPage(0, { sort: bSort, filters: next }) }, 350)
  }

  const clearBrowseMods = (): void => {
    setBSort(null)
    setBFilters({})
    setBFilterOpen(null)
    void goPage(0, null)
  }

  const queryColumns: string[] = rows?.columns ?? []
  const gridRows: unknown[][] = rows?.rows ?? []
  const hasBrowseMods = bSort !== null || Object.values(bFilters).some((value) => value.trim() !== '')
  const grid = activeCell && rows && activeCell.row < rows.rows.length
    ? rows.rows[activeCell.row] ?? null
    : null
  const activeValue = grid && rows ? grid[activeCell?.col ?? -1] : undefined

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 10, alignItems: 'start' }}>
      <div className="db-card" style={{ maxHeight: 640, overflow: 'auto' }}>
        <div className="db-card-title">
          <span>📚 表 / 视图 / 集合</span>
          {database ? <span className="db-badge db-badge-type">{database}</span> : null}
        </div>
        {aware && (
          <div style={{ marginBottom: 8 }}>
            <select style={{ width: '100%' }} value={schema ?? ''}
              onChange={(e) => { const next = e.target.value; setSchema(next || undefined); void loadTables(next || undefined) }}>
              {schemas.map((entry) => <option key={entry.name} value={entry.name}>{entry.name}</option>)}
            </select>
          </div>
        )}
        {busy && <div className="db-muted" style={{ padding: '6px 0' }}>{busy}</div>}
        {tables.length === 0 && !busy
          ? <div className="db-empty">（空）</div>
          : <div className="db-list">
              {tables.map((entry) => (
                <div key={`${entry.name}-${entry.kind}`} className={`db-list-item ${table?.name === entry.name ? 'db-active' : ''}`} onClick={() => openTable(entry)}>
                  <span>{entry.kind === 'view' ? '👁' : entry.kind === 'collection' ? '📦' : '🗂'}</span>
                  <span className="db-grow" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.name}</span>
                  <span className="db-badge">{entry.kind === 'collection' ? '集合' : entry.kind === 'view' ? '视图' : '表'}</span>
                </div>
              ))}
            </div>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
        <div className="db-card" style={{ padding: 0 }}>
          <button
            className="db-card-title db-structure-toggle"
            onClick={() => setShowStructure((previous) => !previous)}
            title={showStructure ? '点击折叠' : '点击展开'}
            style={{ width: '100%', cursor: 'pointer', border: 0, background: 'none', textAlign: 'left' }}
          >
            <span>{showStructure ? '▾' : '▸'} 🧬 字段结构{table ? `：${table.name}` : ''}</span>
            {columns.length > 0
              ? <span className="db-badge db-badge-type">{columns.length} 个字段</span>
              : <span className="db-muted">（选择表后展开查看）</span>}
          </button>
          {showStructure && (
            <div style={{ padding: '6px 10px 10px', borderTop: '1px solid var(--db-border, rgba(128,128,128,.25))' }}>
              {columns.length === 0
                ? <div className="db-empty">{table ? '（读取失败或无字段）' : '在左侧选择一张表'}</div>
                : <div className="db-list">
                    {columns.map((column) => (
                      <div key={column.name} className="db-list-item" style={{ cursor: 'default' }}>
                        <span className="db-grow" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--db-mono)' }}>{column.name}</span>
                        <span className="db-badge db-badge-type" style={{ maxWidth: '45%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{column.type}</span>
                        {column.primary ? <span className="db-badge">PK</span> : null}
                        {column.nullable === false ? <span className="db-badge">NOT NULL</span> : null}
                      </div>
                    ))}
                  </div>}
            </div>
          )}
        </div>
        <div className="db-card">
          <div className="db-card-title">
            <span>🔍 数据预览{table ? `：${table.name}` : ''}{schema && aware ? `（${schema}）` : ''}</span>
            {rows
              ? <span className="db-muted">{rows.total !== undefined ? `共 ${rows.total} 行 · 本页 ${rows.rowCount}` : `${rows.rowCount} 行 · 偏移 ${offset}`}</span>
              : null}
          </div>
          <Banner kind="error" text={error} />
          {cellMsg && <Banner kind={cellMsg.kind === 'ok' ? 'ok' : 'error'} text={cellMsg.text} />}
          {hasBrowseMods && table ? (
            <div className="db-row" style={{ margin: '2px 0 6px', gap: 8 }}>
              <span className="db-ok">已启用整表{Object.values(bFilters).some((v) => v.trim() !== '') ? '过滤' : ''}{bSort ? '排序' : ''}</span>
              <button onClick={clearBrowseMods}>清除排序 / 过滤</button>
              <span className="db-muted" style={{ fontSize: 11 }}>排序/过滤由数据库执行，翻页继续生效</span>
            </div>
          ) : null}
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            <div className="db-gridx">
              {!rows
                ? <div className="db-empty" style={{ padding: 14 }}>在左侧选择一张表，这里显示数据预览</div>
                : gridRows.length === 0
                  ? <div className="db-empty" style={{ padding: 14 }}>{rows.message ?? '（无数据）'}</div>
                  : <ResizableTableGrid
                      columns={queryColumns}
                      rows={gridRows}
                      active={activeCell}
                      onCellClick={(row, col) => { setActiveCell({ row, col }); setCellMsg(null) }}
                      interaction={connection.type === 'mongodb' ? undefined : {
                        sort: bSort,
                        onSort: onSortBrowse,
                        filters: bFilters,
                        onFilter: onFilterBrowse,
                        filterOpen: bFilterOpen,
                        onFilterOpen: (col) => setBFilterOpen(col),
                      }}
                    />}
              <div className="db-muted" style={{ padding: '4px 2px', fontSize: 12 }}>
                点击任意单元格可在右侧查看 / 编辑；拖动表头分隔线可调列宽；{connection.type !== 'mongodb' ? '点击列名排序、⚲ 过滤（作用于整表）' : ''}
              </div>
            </div>
            {activeCell && grid && table && (
              <CellDetailEditor
                key={`${activeCell.row}-${activeCell.col}`}
                connection={connection}
                table={table}
                schema={schema}
                database={database}
                tableName={table.name}
                queryColumns={queryColumns}
                metaColumns={columns}
                row={grid}
                colIndex={activeCell.col}
                onClose={() => setActiveCell(null)}
                onSaved={() => { void goPage(offset) }}
                onMessage={(text, kind) => setCellMsg({ text, kind })}
              />
            )}
          </div>
          {rows && rows.kind === 'select' && table && (
            <div className="db-row" style={{ marginTop: 8, gap: 8 }}>
              <button disabled={offset <= 0} onClick={() => goPage(offset - limit)}>← 上一页</button>
              <button
                disabled={rows.total !== undefined ? offset + limit >= rows.total : gridRows.length < limit}
                onClick={() => goPage(offset + limit)}
              >下一页 →</button>
              <span className="db-muted">每页</span>
              <select value={limit} onChange={(e) => { const next = Number(e.target.value); setLimit(next); void goPage(0, undefined, next) }}>
                {[50, 200, 500, 1000, 5000].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ SQL 控制台 */

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
function ResultTableView({
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
  const [sort, setSort] = useState<{ col: number; dir: 1 | -1 } | null>(null)
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

function SqlPanel({ connection, database }: { connection: ConnectionView; database?: string }) {
  const [sql, setSql] = useState('')
  const [readOnly, setReadOnly] = useState(true)
  const [result, setResult] = useState<QueryResult | null>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  // 取数上限：默认 200 行/页（快速返回；需要更多时调大后重新执行）
  const [pageLimit, setPageLimit] = useState(200)

  const run = async (targetSql?: string): Promise<void> => {
    const statement = (targetSql ?? sql).trim()
    if (!statement) { setError('请输入 SQL'); return }
    setRunning(true)
    setError('')
    try {
      setResult(await dbApi.query(connection.id, statement, readOnly, pageLimit, database))
    } catch (reason) {
      setError(await errText(reason))
      setResult(null)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="db-card">
      <div className="db-card-title">
        <span>⌨️ SQL 控制台：{connection.name}</span>
        {database ? <span className="db-badge db-badge-type">库：{database}</span> : null}
        <span className="db-muted">{connection.type === 'mongodb' ? '提示：这里也接受 JSON 查询（带 collection 字段）' : '提示：多条语句仅在非只读时允许'}</span>
      </div>
      <textarea className="db-code" value={sql} onChange={(e) => setSql(e.target.value)}
        placeholder={connection.type === 'mongodb'
          ? '{"collection":"users","filter":{"age":{"$gt":18}},"limit":50}'
          : 'SELECT * FROM 表名 LIMIT 100;\n-- 只读模式默认开启' } spellCheck={false} />
      <div className="db-row" style={{ margin: '8px 0' }}>
        <label className="db-row" style={{ cursor: 'pointer', gap: 6 }}>
          <input type="checkbox" checked={readOnly} onChange={(e) => setReadOnly(e.target.checked)} /> 只读模式（推荐）
        </label>
        <div className="db-grow" />
        <button className="db-btn-primary" onClick={() => run()} disabled={running}>{running ? '执行中…' : '执行 (Ctrl+Enter)'}</button>
      </div>
      <Banner kind="error" text={error} />
      <ResultTableView result={result} limit={pageLimit} onLimitChange={setPageLimit} />
    </div>
  )
}

/* ------------------------------------------------------------------ NL 查询 */

function AiPanel({ connection, database }: { connection: ConnectionView; database?: string }) {
  const [question, setQuestion] = useState('')
  const [generated, setGenerated] = useState<GenerateResult | null>(null)
  const [aiResult, setAiResult] = useState<AiRunResult | null>(null)
  const [editSql, setEditSql] = useState('')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  // 执行结果取数上限（默认 200 行/页）
  const [pageLimit, setPageLimit] = useState(200)
  // 模型复用 DSH 自身配置：只在下拉里“按需选择”，不在插件里重复配置
  const [models, setModels] = useState<AiModelsResult | null>(null)
  const [modelIndex, setModelIndex] = useState(-1)

  const modelOptions = useMemo<Array<{ provider?: string; model?: string; label: string }>>(() => {
    type Entry = { provider?: string; model?: string; label: string }
    return (models?.providers ?? []).flatMap<Entry>((provider) => {
      const providerLabel = provider.label && provider.label.length > 0
        ? `${provider.label}（${provider.provider}）`
        : provider.provider
      if (provider.models.length === 0) {
        return [{ provider: provider.provider, label: `${providerLabel} · 默认模型` }]
      }
      return provider.models.map((model): Entry => ({
        provider: provider.provider,
        model: model.id,
        label: `${providerLabel} / ${model.label && model.label.length > 0 ? model.label : model.id}`,
      }))
    })
  }, [models])

  const selection = (): { provider?: string; model?: string } | undefined => {
    const entry = modelIndex >= 0 ? modelOptions[modelIndex] : undefined
    if (!entry) return undefined
    return {
      ...(entry.provider ? { provider: entry.provider } : {}),
      ...(entry.model ? { model: entry.model } : {}),
    }
  }

  useEffect(() => {
    let stale = false
    dbApi.aiModels().then((result) => {
      if (!stale) setModels(result)
    }).catch(() => {
      if (!stale) setModels(null)
    })
    return () => { stale = true }
  }, [])

  const generate = async (): Promise<void> => {
    if (!question.trim()) { setError('请输入要查询的问题'); return }
    setBusy('AI 生成 SQL 中…')
    setError('')
    try {
      const result = await dbApi.aiGenerate(connection.id, question, selection(), database)
      setGenerated(result)
      setEditSql(result.sql)
      setAiResult(null)
    } catch (reason) {
      setError(await errText(reason))
    } finally {
      setBusy('')
    }
  }

  const runGenerated = async (): Promise<void> => {
    if (!editSql.trim() && !question.trim()) { setError('没有可执行的 SQL，请先生成或填写'); return }
    setBusy('执行查询中…')
    setError('')
    try {
      const result = await dbApi.aiRun(connection.id, question || editSql, selection(), pageLimit, database)
      setAiResult(result)
      setGenerated({ sql: result.sql, engine: result.engine, provider: result.provider, model: result.model, note: result.note })
      setEditSql(result.sql)
    } catch (reason) {
      setError(await errText(reason))
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="db-card">
      <div className="db-card-title">
        <span>💬 自然语言查询：{connection.name}</span>
        {database ? <span className="db-badge db-badge-type">库：{database}</span> : null}
        <span className="db-muted">模型复用 DSH 配置，无需在插件中填 Key</span>
      </div>
      <div className="db-row" style={{ gap: 8, margin: '2px 0 8px' }}>
        <label className="db-muted" style={{ whiteSpace: 'nowrap' }}>按需选模型：</label>
        <select value={modelIndex} onChange={(e) => setModelIndex(Number(e.target.value))} style={{ maxWidth: 420 }}>
          <option value={-1}>自动（由 DSH 选择）</option>
          {modelOptions.map((entry, index) => (
            <option key={index} value={index}>{entry.label}</option>
          ))}
        </select>
        {models && !models.ok
          ? <span className="db-badge" style={{ color: 'var(--db-err)', borderColor: 'rgba(255,95,86,.4)' }}>{models.message ?? '模型服务不可用'}</span>
          : null}
        {models === null ? <span className="db-muted">（读取 DSH 模型列表中…）</span> : null}
      </div>
      <textarea className="db-code" style={{ minHeight: 90 }} value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="例如：统计本月每个城市的下单用户数和订单总额，按城市排序" spellCheck={false} />
      <div className="db-row" style={{ margin: '8px 0' }}>
        <button className="db-btn-primary" onClick={generate} disabled={busy !== '' || !question.trim()}>{busy === 'AI 生成 SQL 中…' ? '生成中…' : '生成 SQL'}</button>
        <button disabled={busy !== '' || !question.trim()} onClick={runGenerated}>{busy === '执行查询中…' ? '执行中…' : '生成并直接查询'}</button>
        <div className="db-grow" />
        <button className="db-btn-ghost" onClick={() => { setGenerated(null); setEditSql(''); setAiResult(null); }}>清空</button>
      </div>
      <Banner kind="error" text={error} />
      {busy && busy !== 'AI 生成 SQL 中…' && busy !== '执行查询中…' ? <div className="db-muted">{busy}</div> : null}
      {generated && (
        <div className="db-card" style={{ background: 'var(--db-panel-2)' }}>
          <div className="db-card-title">
            <span>🤖 生成的 SQL（可修改后执行）</span>
            <span className="db-muted">
              {generated.engine === 'custom' ? '自定义端点' : 'DSH 模型'}
              {generated.provider ? ` · ${generated.provider}${generated.model ? `/${generated.model}` : ''}` : ''}
              {generated.note ? ` · ${generated.note}` : ''}
            </span>
          </div>
          <textarea className="db-code" value={editSql} onChange={(e) => setEditSql(e.target.value)} spellCheck={false} style={{ minHeight: 110 }} />
          <div className="db-row" style={{ marginTop: 8 }}>
            <button className="db-btn-primary" onClick={runGenerated} disabled={busy !== ''}>执行此 SQL（只读）</button>
          </div>
        </div>
      )}
      {aiResult && (<>
        <div className="db-divider" />
        <ResultTableView result={aiResult.result} limit={pageLimit} onLimitChange={setPageLimit} />
      </>)}
      {generated && !aiResult && (
        <div className="db-divider" />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ 根组件 */

type TabId = 'connections' | 'browse' | 'sql' | 'ai'

export interface AppProps {
  /** 提供时在顶栏显示“关闭/回到对话”按钮 */
  onClose?: () => void
  /** 独立预览模式（无 DSH 中栏） */
  standalone?: boolean
}

export default function App(props: AppProps = {}) {
  const [connections, setConnections] = useState<ConnectionView[]>([])
  const [selected, setSelected] = useState<ConnectionView | null>(null)
  const [tab, setTab] = useState<TabId>('connections')
  const [status, setStatus] = useState({ level: 'info', text: '加载中…' })
  const [busyList, setBusyList] = useState(false)
  const firstRun = useRef(true)
  // 数据库切换（PG/MySQL：服务器上可选库，空=连接保存的默认库）
  const [databases, setDatabases] = useState<string[]>([])
  const [database, setDatabase] = useState('')

  const dbSwitchable = (type?: DbType): boolean => type === 'postgresql' || type === 'mysql'

  useEffect(() => {
    setDatabase('')
    const id = selected?.id
    const type = selected?.type
    setDatabases([])
    if (!id || !dbSwitchable(type)) return undefined
    let stale = false
    dbApi.databases(id).then((result) => {
      if (!stale && result.supported) setDatabases(result.databases)
    }).catch(() => {
      if (!stale) setDatabases([])
    })
    return () => { stale = true }
  }, [selected?.id, selected?.type])

  const refresh = useCallback(async (): Promise<void> => {
    setBusyList(true)
    try {
      const { connections: list } = await dbApi.connections()
      setConnections(list)
      setSelected((current) => {
        if (!current) return null
        return list.find((entry) => entry.id === current.id) ?? null
      })
      if (list.length === 0) setStatus({ level: 'info', text: '尚未配置连接' })
      else setStatus({ level: 'info', text: `${list.length} 个连接已加载` })
    } catch (reason) {
      const text = await errText(reason)
      setStatus({ level: 'error', text: `加载连接列表失败：${text}（请确认插件已在 DSH 中启用）` })
    } finally {
      setBusyList(false)
    }
  }, [])

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      void refresh()
    }
  }, [refresh])

  const openConnection = (record: ConnectionView): void => {
    setSelected(record)
    setTab('browse')
  }

  const openConsole = (record: ConnectionView): void => {
    setSelected(record)
    setTab('sql')
  }

  const selectFromDropdown = (value: string): void => {
    if (value === '__manage') { setTab('connections'); return }
    const record = connections.find((entry) => entry.id === value) ?? null
    setSelected(record)
    if (record && tab === 'browse') setTab('browse')
  }

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '4px 0 40px' }}>
      <div className="db-topbar">
        <div className="db-title"><span className="db-logo">DB</span> 数据库工作台
          <span className="db-badge db-badge-type">dsh-database-console</span></div>
        <div className="db-grow" />
        {busyList ? <span className="db-muted">…</span> : null}
        {props.onClose ? (
          <button onClick={props.onClose} title="关闭面板，回到对话">
            {props.standalone ? '✕ 关闭' : '✕ 回到对话'}
          </button>
        ) : null}
      </div>

      <div className="db-seg" style={{ marginBottom: 10 }}>
        <button className={tab === 'connections' ? 'db-active' : ''} onClick={() => setTab('connections')}>🔌 连接管理</button>
        <button className={tab === 'browse' ? 'db-active' : ''} disabled={!selected} onClick={() => setTab('browse')}>📚 数据浏览</button>
        <button className={tab === 'sql' ? 'db-active' : ''} disabled={!selected} onClick={() => setTab('sql')}>⌨️ SQL 控制台</button>
        <button className={tab === 'ai' ? 'db-active' : ''} disabled={!selected} onClick={() => setTab('ai')}>💬 自然语言查询</button>
      </div>

      {status.text.startsWith('加载连接列表失败') || status.level === 'error'
        ? <Banner kind="error" text={status.text} /> : null}

      {selected && (
        <div className="db-row" style={{ marginBottom: 10, gap: 8 }}>
          <label className="db-muted">当前连接：</label>
          <select value={selected.id} onChange={(e) => selectFromDropdown(e.target.value)}>
            {connections.map((record) => (
              <option key={record.id} value={record.id}>{record.name}（{TYPE_LABELS[record.type]}）</option>
            ))}
            <option value="__manage">→ 去连接管理…</option>
          </select>
          {dbSwitchable(selected.type) && databases.length > 0 && (
            <>
              <label className="db-muted">数据库：</label>
              <select value={database} onChange={(e) => setDatabase(e.target.value)} title="切换后浏览/控制台/AI 均针对所选库">
                <option value="">默认（{selected.database || '登录用户默认库'}）</option>
                {databases.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </>
          )}
          <button className="db-btn-ghost" onClick={() => openConsole(selected)}>打开 SQL 控制台</button>
        </div>
      )}

      <div style={{ display: tab === 'connections' ? 'block' : 'none' }}>
        <ConnectionPanel connections={connections} onRefresh={refresh} onOpen={openConnection} />
      </div>
      {selected && (
        <>
          <div style={{ display: tab === 'browse' ? 'block' : 'none' }}>
            <BrowsePanel connection={selected} database={database || undefined} />
          </div>
          <div style={{ display: tab === 'sql' ? 'block' : 'none' }}>
            <SqlPanel connection={selected} database={database || undefined} />
          </div>
          <div style={{ display: tab === 'ai' ? 'block' : 'none' }}>
            <AiPanel connection={selected} database={database || undefined} />
          </div>
        </>
      )}
    </div>
  )
}
