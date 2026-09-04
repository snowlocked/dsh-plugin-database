/**
 * dsh-database-console 右侧工作区面板。
 *
 * TableWorkspace = 「一张表/视图/集合的工作区」，内部分三个子页：
 *   - 📚 数据浏览：该表的分页预览（字段结构、整表排序/过滤、单元格编辑）
 *   - ⌨️ SQL 查询：对该连接执行 SQL（目标库默认跟随该表所在库，可切换）
 *   - 💬 自然语言查询：AI NL→SQL（同样默认跟随该表所在库）
 *
 * 子页懒加载（首次点开才创建），创建后保持挂载 —— 切换子页/切换外层 Tab/
 * 收起再打开数据库工作台都不丢各自的输入与结果状态。
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { dbApi, isSchemaAware, TYPE_LABELS } from './client.ts'
import type {
  AiModelsResult,
  AiRunResult,
  ColumnEntry,
  ConnectionView,
  GenerateResult,
  QueryResult,
} from './client.ts'
import type { BrowseTarget } from './target.ts'
import { Banner, CellDetailEditor, errText, ResizableTableGrid, ResultTableView } from './ui.tsx'
import type { BrowseSort } from './ui.tsx'

/* ------------------------------------------------------------------ 单表数据浏览 */

/** 把浏览状态映射为服务端认识的列名参数（无生效项返回 null）。 */
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

function BrowseView({ connection, target }: { connection: ConnectionView; target: BrowseTarget }) {
  const { table, database, schema } = target
  const aware = isSchemaAware(connection.type)
  const [columns, setColumns] = useState<ColumnEntry[]>([])
  const [rows, setRows] = useState<QueryResult | null>(null)
  const [offset, setOffset] = useState(0)
  const [limit, setLimit] = useState(200)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
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

  // 子页挂载即取数（字段 + 首页数据）。目标对象固定，只在首次/身份变化时加载。
  useEffect(() => {
    let stale = false
    setBusy(`读取「${table.name}」…`)
    setError('')
    setActiveCell(null)
    setCellMsg(null)
    setBSort(null)
    setBFilters({})
    setBFilterOpen(null)
    if (filterTimer.current !== undefined) { window.clearTimeout(filterTimer.current); filterTimer.current = undefined }
    Promise.all([
      dbApi.columns(connection.id, table.name, schema, database),
      dbApi.rows(connection.id, table.name, schema, limit, 0, database),
    ]).then(([cols, data]) => {
      if (stale) return
      setColumns(cols.columns)
      setRows(data)
    }).catch(async (reason) => {
      if (!stale) setError(await errText(reason))
    }).finally(() => {
      if (!stale) setBusy('')
    })
    return () => { stale = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection.id, table.name, schema, database])

  /** 统一取数：override 传 null=不带排序过滤；传 {sort,filters}=显式；undefined=用当前状态。useLimit 可选覆盖页大小。 */
  const goPage = async (
    nextOffset: number,
    override?: { sort: BrowseSort | null; filters: Record<number, string> } | null,
    useLimit?: number,
  ): Promise<void> => {
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

  return (
    <div className="db-pane-stack">
      <div className="db-card" style={{ padding: 0 }}>
        <button
          className="db-card-title db-structure-toggle"
          onClick={() => setShowStructure((previous) => !previous)}
          title={showStructure ? '点击折叠' : '点击展开'}
          style={{ width: '100%', cursor: 'pointer', border: 0, background: 'none', textAlign: 'left' }}
        >
          <span>{showStructure ? '▾' : '▸'} 🧬 字段结构（{columns.length} 个字段）</span>
          {busy ? <span className="db-muted">{busy}</span> : columns.length === 0 ? <span className="db-muted">（读取失败或无字段）</span> : null}
        </button>
        {showStructure && (
          <div style={{ padding: '6px 10px 10px', borderTop: '1px solid var(--db-border, rgba(128,128,128,.25))' }}>
            {columns.length === 0
              ? <div className="db-empty">{error ? '（读取失败）' : '（无字段）'}</div>
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

      <div className="db-card" style={{ padding: 0 }}>
        <div className="db-card-title" style={{ padding: '10px 12px 0' }}>
          <span>🔍 数据预览</span>
          {rows
            ? <span className="db-muted">{rows.total !== undefined ? `共 ${rows.total} 行 · 本页 ${rows.rowCount}` : `${rows.rowCount} 行 · 偏移 ${offset}`}</span>
            : null}
        </div>
        <div style={{ padding: '0 12px' }}>
          <Banner kind="error" text={error} />
          {cellMsg && <Banner kind={cellMsg.kind === 'ok' ? 'ok' : 'error'} text={cellMsg.text} />}
          {busy && <div className="db-muted" style={{ padding: '6px 0' }}>{busy}</div>}
          {hasBrowseMods ? (
            <div className="db-row" style={{ margin: '2px 0 6px', gap: 8 }}>
              <span className="db-ok">已启用整表{Object.values(bFilters).some((v) => v.trim() !== '') ? '过滤' : ''}{bSort ? '排序' : ''}</span>
              <button onClick={clearBrowseMods}>清除排序 / 过滤</button>
              <span className="db-muted" style={{ fontSize: 11 }}>排序/过滤由数据库执行，翻页继续生效</span>
            </div>
          ) : null}
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            <div className="db-gridx">
              {!rows
                ? <div className="db-empty" style={{ padding: 14 }}>{busy || '加载中…'}</div>
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
            {activeCell && grid && rows && (
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
          {rows && rows.kind === 'select' && (
            <div className="db-row" style={{ marginTop: 8, gap: 8, paddingBottom: 10 }}>
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

/* ------------------------------------------------------------------ 通用：目标库下拉 */

function useSwitchableDatabases(connection: ConnectionView) {
  const [databases, setDatabases] = useState<string[]>([])
  const switchable = connection.type === 'postgresql' || connection.type === 'mysql'
  useEffect(() => {
    let stale = false
    setDatabases([])
    if (!switchable) return undefined
    dbApi.databases(connection.id).then((result) => {
      if (!stale && result.supported) setDatabases(result.databases)
    }).catch(() => { /* 静默：保留“默认库”选择 */ })
    return () => { stale = true }
  }, [connection.id, switchable])
  return { switchable, databases }
}

/* ------------------------------------------------------------------ SQL 查询子页 */

function SqlConsole({ connection, initialDatabase }: { connection: ConnectionView; initialDatabase?: string }) {
  const [sql, setSql] = useState('')
  const [readOnly, setReadOnly] = useState(true)
  const [result, setResult] = useState<QueryResult | null>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  // 目标数据库：默认跟随该表所在库（'' = 连接保存的默认库）；本子页自身状态，切页不重置
  const [database, setDatabase] = useState(initialDatabase ?? '')
  // 取数上限：默认 200 行/页（快速返回；需要更多时调大后重新执行）
  const [pageLimit, setPageLimit] = useState(200)
  const { switchable, databases } = useSwitchableDatabases(connection)

  const run = async (targetSql?: string): Promise<void> => {
    const statement = (targetSql ?? sql).trim()
    if (!statement) { setError('请输入 SQL'); return }
    setRunning(true)
    setError('')
    try {
      setResult(await dbApi.query(connection.id, statement, readOnly, pageLimit, database || undefined))
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
        <span>⌨️ SQL 查询{connection.type === 'mongodb' ? '' : `：${connection.name}`}</span>
        {switchable && (
          <span className="db-row" style={{ gap: 6 }}>
            <span className="db-muted">目标库</span>
            <select value={database} onChange={(e) => setDatabase(e.target.value)} title="该子页的目标数据库（默认=连接默认库）">
              <option value="">默认（{connection.database || '登录用户默认库'}）</option>
              {databases.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </span>
        )}
        <span className="db-muted">{connection.type === 'mongodb' ? '提示：这里也接受 JSON 查询（带 collection 字段）' : '提示：多条语句仅在非只读时允许'}</span>
      </div>
      <textarea className="db-code" value={sql} onChange={(e) => setSql(e.target.value)}
        placeholder={connection.type === 'mongodb'
          ? '{"collection":"users","filter":{"age":{"$gt":18}},"limit":50}'
          : 'SELECT * FROM 表名 LIMIT 100;\n-- 只读模式默认开启'} spellCheck={false} />
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

/* ------------------------------------------------------------------ 自然语言查询子页 */

function AiQuery({ connection, initialDatabase }: { connection: ConnectionView; initialDatabase?: string }) {
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
  // 目标数据库：默认跟随该表所在库
  const [database, setDatabase] = useState(initialDatabase ?? '')
  const { switchable, databases } = useSwitchableDatabases(connection)

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
      const result = await dbApi.aiGenerate(connection.id, question, selection(), database || undefined)
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
      const result = await dbApi.aiRun(connection.id, question || editSql, selection(), pageLimit, database || undefined)
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
        {switchable && (
          <span className="db-row" style={{ gap: 6 }}>
            <span className="db-muted">目标库</span>
            <select value={database} onChange={(e) => setDatabase(e.target.value)} title="该子页的目标数据库（默认=连接默认库）">
              <option value="">默认（{connection.database || '登录用户默认库'}）</option>
              {databases.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </span>
        )}
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

/* ------------------------------------------------------------------ 表工作区：三子页 */

export type SubView = 'browse' | 'sql' | 'nl'

const KIND_ICON: Record<string, string> = { view: '👁', collection: '📦', table: '🗂' }
const KIND_LABEL: Record<string, string> = { view: '视图', collection: '集合', table: '表' }

export function TableWorkspace({
  connection,
  target,
}: {
  connection: ConnectionView
  /** 打开此 Tab 时的目标对象快照（库/schema/表在该 Tab 生命周期内固定） */
  target: BrowseTarget
}) {
  const { table, database, schema } = target
  const aware = isSchemaAware(connection.type)
  const [sub, setSub] = useState<SubView>('browse')
  // 懒加载：首次点开某子页才创建；创建后保持挂载不卸载
  const [seen, setSeen] = useState<Record<SubView, boolean>>({ browse: true, sql: false, nl: false })
  const choose = (next: SubView): void => {
    setSub(next)
    if (!seen[next]) setSeen((previous) => ({ ...previous, [next]: true }))
  }
  const pageStyle = (view: SubView): { display?: 'none' } | undefined => (sub === view ? undefined : { display: 'none' })

  return (
    <div className="db-pane-stack">
      <div className="db-card db-ws-meta">
        <span className="db-ws-icon">{KIND_ICON[table.kind] ?? '🗂'}</span>
        <strong className="db-ws-name">{table.name}</strong>
        <span className="db-badge db-badge-type">{KIND_LABEL[table.kind] ?? table.kind}</span>
        {database ? <span className="db-badge">库：{database}</span> : null}
        {schema && aware ? <span className="db-badge">schema：{schema}</span> : null}
        <span className="db-badge">{TYPE_LABELS[connection.type]}</span>
        <span className="db-muted db-grow" style={{ textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{connection.name}</span>
      </div>

      <div className="db-seg db-ws-seg" role="tablist" aria-label="工作区子页">
        <button role="tab" aria-selected={sub === 'browse'} className={sub === 'browse' ? 'db-active' : ''} onClick={() => choose('browse')}>
          📚 数据浏览
        </button>
        <button role="tab" aria-selected={sub === 'sql'} className={sub === 'sql' ? 'db-active' : ''} onClick={() => choose('sql')}>
          ⌨️ SQL 查询
        </button>
        <button role="tab" aria-selected={sub === 'nl'} className={sub === 'nl' ? 'db-active' : ''} onClick={() => choose('nl')}>
          💬 自然语言查询
        </button>
      </div>

      <div className="db-ws-pages">
        <div className="db-ws-page" style={pageStyle('browse')}>
          <BrowseView connection={connection} target={target} />
        </div>
        {seen.sql && (
          <div className="db-ws-page" style={pageStyle('sql')}>
            <SqlConsole connection={connection} initialDatabase={database} />
          </div>
        )}
        {seen.nl && (
          <div className="db-ws-page" style={pageStyle('nl')}>
            <AiQuery connection={connection} initialDatabase={database} />
          </div>
        )}
      </div>
    </div>
  )
}
