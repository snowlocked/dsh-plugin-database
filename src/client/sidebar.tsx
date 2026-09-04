/**
 * dsh-database-console 左侧导航：连接管理 + 连接内对象树。
 *
 *  - 每个连接一行：点击行展开该连接下的 数据库(schema)→表 树；
 *  - 点击表行 = 在右侧打开/激活「该表的工作区 Tab」
 *    （Tab 内含 数据浏览 / SQL 查询 / 自然语言查询 三个子页，见 panes.tsx）；
 *  - 展开区提供：目标库选择（PG/MySQL）、schema 选择（PG/达梦）以及 编辑/删除；
 *  - 顶栏有 刷新 与 ＋新建连接，编辑/新建使用就地展开的连接编辑器。
 */
import { Fragment, useEffect, useRef, useState } from 'react'
import { dbApi, defaultPort, isSchemaAware, TYPE_LABELS } from './client.ts'
import type { ConnectionInput, ConnectionView, SchemaEntry, TableEntry } from './client.ts'
import type { BrowseTarget } from './target.ts'
import { Banner, errText } from './ui.tsx'

const SHORT: Record<string, string> = {
  postgresql: 'PG', mysql: 'MySQL', mongodb: 'Mongo', sqlite: 'SQLite', dameng: 'DM',
}
const KIND_ICON: Record<string, string> = { view: '👁', collection: '📦', table: '🗂' }
const KIND_LABEL: Record<string, string> = { view: '视图', collection: '集合', table: '表' }

/* ------------------------------------------------------------------ 连接编辑器（就地） */

interface ConnectionDraft extends ConnectionInput { open: boolean; isNew: boolean; hasPassword?: boolean }

export interface SidebarCallbacks {
  /** 打开/激活某张表的工作区 Tab（database/schema 取当前树选择）。 */
  onOpenBrowse(conn: ConnectionView, target: BrowseTarget): void
}

export interface ConnectionSidebarProps extends SidebarCallbacks {
  connections: ConnectionView[]
  busyList: boolean
  refresh: () => Promise<void>
  /** 会话恢复：列表就绪后自动展开该连接（仅一次）。 */
  focusId?: string | null
  /** 连接被展开/打开时上报（用于记忆上次打开的连接）。 */
  onFocused?(connId: string): void
}

function ConnectionEditor({
  draft,
  onClose,
  onSaved,
  onChanged,
}: {
  draft: ConnectionDraft
  onClose(): void
  onSaved(view: ConnectionView): void
  onChanged(): void
}) {
  const [form, setForm] = useState<ConnectionInput>({ ...draft })
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const meta = (() => {
    const label = TYPE_LABELS[form.type]
    const needsHost = form.type !== 'sqlite'
    const needsDatabase = form.type === 'mysql' || form.type === 'mongodb'
    const supportsDatabase = form.type === 'postgresql' || needsDatabase
    const needsSchema = form.type === 'dameng'
    return { label, needsHost, needsDatabase, supportsDatabase, needsSchema, needFile: form.type === 'sqlite' }
  })()

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
    <div className="db-card db-nav-editor" style={{ margin: '6px 0' }}>
      <div className="db-card-title" style={{ textTransform: 'none', letterSpacing: 0 }}>
        <span>✏️ {draft.isNew ? '新建连接' : `编辑：${form.name}`}</span>
        <button className="db-btn-ghost" onClick={onClose}>收起</button>
      </div>
      <div className="db-grid">
        <div className="db-field">
          <label>名称 *</label>
          <input value={form.name ?? ''} onChange={(e) => patch({ name: e.target.value })} placeholder="例如：生产库-PG" />
        </div>
        <div className="db-field">
          <label>类型</label>
          <select value={form.type} onChange={(e) => patch({ type: e.target.value as ConnectionInput['type'] })}>
            {(['postgresql', 'mysql', 'mongodb', 'sqlite', 'dameng'] as const).map((type) => (
              <option key={type} value={type}>{TYPE_LABELS[type]}</option>
            ))}
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
            : <span className="db-muted">（已保存，留空即用已存密码）</span>}</label>
          <input type="password" value={form.password ?? ''} onChange={(e) => patch({ password: e.target.value })} autoComplete="new-password"
            placeholder={draft.isNew ? '新建连接时填写' : '（已保存，输入可覆盖）'} />
        </div>
        {meta.needFile && (
          <div className="db-field" style={{ gridColumn: '1 / -1' }}>
            <label>数据库文件路径 *</label>
            <input value={form.file ?? ''} onChange={(e) => patch({ file: e.target.value })} placeholder="C:\\data\\app.db 或 相对路径" />
          </div>
        )}
        {meta.supportsDatabase && (
          <div className="db-field">
            <label>默认数据库{meta.needsDatabase ? ' *' : ''}{form.type === 'mongodb' ? '（database）' : ''}</label>
            <input value={form.database ?? ''} onChange={(e) => patch({ database: e.target.value })}
              placeholder={form.type === 'postgresql' ? '可选，留空使用 PG 默认库' : undefined} />
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
            <span>兼容 OpenSSL3：关闭登录/消息加密</span>
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
      {ok ? <Banner kind={ok.startsWith('✅') ? 'ok' : 'info'} text={ok} /> : null}
      <div className="db-row" style={{ marginTop: 8 }}>
        <button className="db-btn-primary" onClick={handleSave} disabled={saving}>{saving ? '保存中…' : '保存连接'}</button>
        <button onClick={handleTest} disabled={testing}>{testing ? '测试中…' : '测试连接'}</button>
        <button className="db-btn-ghost" onClick={onClose}>取消</button>
      </div>
    </div>
  )
}

/** ConnTree 可用的全部回调（父组件就地提供）。 */
export interface TreeCallbacks extends SidebarCallbacks {
  onEdit(conn: ConnectionView): void
  onDelete(conn: ConnectionView): void
  onCollapse(): void
}

/* ------------------------------------------------------------------ 连接内对象树 */

function ConnTree({
  connection,
  callbacks,
}: {
  connection: ConnectionView
  callbacks: TreeCallbacks
}) {
  const aware = isSchemaAware(connection.type)
  const switchable = connection.type === 'postgresql' || connection.type === 'mysql'
  const [database, setDatabase] = useState('')
  const [schema, setSchema] = useState<string | undefined>()
  const [databases, setDatabases] = useState<string[]>([])
  const [schemas, setSchemas] = useState<SchemaEntry[]>([])
  const [tables, setTables] = useState<TableEntry[]>([])
  const [loading, setLoading] = useState('')
  const [error, setError] = useState('')
  const seq = useRef(0)
  const guard = (id: number): boolean => seq.current === id

  const loadTables = async (id: number, db: string, sch?: string): Promise<void> => {
    if (!guard(id)) return
    setLoading('加载表…')
    try {
      const { tables: list } = await dbApi.tables(connection.id, sch, db || undefined)
      if (!guard(id)) return
      setTables(list)
    } catch (reason) {
      if (guard(id)) setError(await errText(reason))
    } finally {
      if (guard(id)) setLoading('')
    }
  }

  // 挂载即加载：数据库列表 → schema 列表（自动选 public/连接 schema/首个）→ 表
  useEffect(() => {
    const id = ++seq.current
    setLoading('加载对象…')
    setError('')
    void (async () => {
      try {
        if (switchable) {
          const r = await dbApi.databases(connection.id)
          if (!guard(id)) return
          if (r.supported) setDatabases(r.databases)
        }
        let preferred: string | undefined
        if (aware) {
          const r = await dbApi.schemas(connection.id, undefined)
          if (!guard(id)) return
          setSchemas(r.schemas)
          preferred = r.schemas.find((entry) => entry.name === 'public')?.name
            ?? r.schemas.find((entry) => entry.name === connection.schema)?.name
            ?? r.schemas[0]?.name
          setSchema(preferred)
        }
        await loadTables(id, '', preferred)
      } catch (reason) {
        if (guard(id)) setError(await errText(reason))
      } finally {
        if (guard(id)) setLoading('')
      }
    })()
    return () => { seq.current += 1 }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection.id])

  const changeDb = async (next: string): Promise<void> => {
    const id = ++seq.current
    setDatabase(next)
    setTables([])
    setSchemas([])
    setSchema(undefined)
    setError('')
    try {
      if (aware) {
        setLoading('加载模式…')
        const r = await dbApi.schemas(connection.id, next || undefined)
        if (!guard(id)) return
        setSchemas(r.schemas)
        const preferred = r.schemas.find((entry) => entry.name === 'public')?.name
          ?? r.schemas.find((entry) => entry.name === connection.schema)?.name
          ?? r.schemas[0]?.name
        setSchema(preferred)
        await loadTables(id, next, preferred)
      } else {
        await loadTables(id, next)
      }
    } catch (reason) {
      if (guard(id)) setError(await errText(reason))
    } finally {
      if (guard(id)) setLoading('')
    }
  }

  const changeSchema = async (next: string): Promise<void> => {
    const id = ++seq.current
    setSchema(next || undefined)
    setTables([])
    setError('')
    await loadTables(id, database, next || undefined)
  }

  const openBrowse = (table: TableEntry): void => {
    callbacks.onOpenBrowse(connection, {
      table,
      ...(database ? { database } : {}),
      ...(schema && aware ? { schema } : {}),
    })
  }

  return (
    <div className="db-tree">
      {switchable && (
        <div className="db-tree-row">
          <span className="db-muted">数据库</span>
          <select value={database} onChange={(e) => void changeDb(e.target.value)} title="切换后重新加载该库下的对象">
            <option value="">默认（{connection.database || '连接默认库'}）</option>
            {databases.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
      )}
      {aware && schemas.length > 0 && (
        <div className="db-tree-row">
          <span className="db-muted">schema</span>
          <select value={schema ?? ''} onChange={(e) => void changeSchema(e.target.value)} title="切换模式并加载其对象">
            {schemas.map((entry) => <option key={entry.name} value={entry.name}>{entry.name}</option>)}
          </select>
        </div>
      )}
      {error ? <Banner kind="error" text={error} /> : null}
      {loading ? <div className="db-muted db-tree-hint">{loading}</div> : null}
      {!loading && tables.length === 0 && !error ? (
        <div className="db-muted db-tree-hint">（该库/模式下没有表或视图）</div>
      ) : null}
      <div className="db-tree-tables">
        {tables.map((entry) => (
          <button
            key={`${entry.name}-${entry.kind}`}
            className="db-tree-table"
            title={`${KIND_LABEL[entry.kind] ?? entry.kind}「${entry.name}」——点击在右侧打开工作区 Tab（数据浏览 / SQL 查询 / 自然语言）`}
            onClick={() => openBrowse(entry)}
          >
            <span>{KIND_ICON[entry.kind] ?? '🗂'}</span>
            <span className="db-grow" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.name}</span>
            <span className="db-badge">{KIND_LABEL[entry.kind] ?? entry.kind}</span>
          </button>
        ))}
      </div>
      <div className="db-tree-actions" style={{ gap: 6 }}>
        <span className="db-muted db-grow" style={{ fontSize: 11 }}>点击表/视图/集合在右侧打开其工作区</span>
      </div>
      <div className="db-tree-actions" style={{ borderTop: '1px solid var(--db-border)', paddingTop: 6, marginTop: 4 }}>
        <button onClick={() => callbacks.onEdit(connection)}>✏️ 编辑</button>
        <button className="db-btn-danger" onClick={() => void callbacks.onDelete(connection)}>删除</button>
        <span className="db-grow" />
        <button className="db-btn-ghost" title="收起该连接的对象树" onClick={() => callbacks.onCollapse()}>收起 ▴</button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ 左侧导航整体 */

export function ConnectionSidebar(props: ConnectionSidebarProps) {
  const { connections, busyList, refresh, focusId } = props
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editor, setEditor] = useState<ConnectionDraft | null>(null)
  const [error, setError] = useState('')
  const restoreDone = useRef(false)
  // 保存成功后自动展开新建/编辑的连接
  const [pendingExpand, setPendingExpand] = useState<string | null>(null)

  // 会话恢复：列表就绪后展开 focusId（仅一次）
  useEffect(() => {
    if (restoreDone.current || !focusId) return
    if (connections.some((entry) => entry.id === focusId)) {
      restoreDone.current = true
      setExpandedId(focusId)
      props.onFocused?.(focusId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connections, focusId])

  // 保存成功（新建/编辑）后：等列表刷新到位再自动展开该连接
  useEffect(() => {
    if (!pendingExpand) return
    if (connections.some((entry) => entry.id === pendingExpand)) {
      setExpandedId(pendingExpand)
      props.onFocused?.(pendingExpand)
      setPendingExpand(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connections, pendingExpand])

  const toggle = (conn: ConnectionView): void => {
    setError('')
    if (expandedId === conn.id) {
      setExpandedId(null)
    } else {
      setExpandedId(conn.id)
      props.onFocused?.(conn.id)
    }
  }

  const openEditor = (record: ConnectionView | null): void => {
    setError('')
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
          hasPassword: record.hasPassword,
          open: true,
          isNew: false,
        }
      : { name: '', type: 'postgresql', open: true, isNew: true })
  }

  const handleDelete = async (record: ConnectionView): Promise<void> => {
    if (!window.confirm(`确定删除连接「${record.name}」吗？`)) return
    setError('')
    try {
      const result = await dbApi.remove(record.id)
      if (!result.ok) setError(`删除失败：未找到连接 ${record.id}（可能已被其它页面删除）`)
      if (expandedId === record.id) setExpandedId(null)
      await refresh()
    } catch (reason) {
      setError(await errText(reason))
    }
  }

  return (
    <div className="db-nav">
      <div className="db-nav-head">
        <span className="db-nav-title">🔌 连接管理{connections.length > 0 ? `（${connections.length}）` : ''}</span>
        <span className="db-row" style={{ gap: 6 }}>
          <button title="刷新连接列表" onClick={() => void refresh()} disabled={busyList}>{busyList ? '…' : '↻'}</button>
          <button className="db-btn-primary" title="新建连接" onClick={() => openEditor(null)}>＋ 新建</button>
        </span>
      </div>
      <Banner kind="error" text={error} />
      {editor && editor.open && (
        <ConnectionEditor
          draft={editor}
          onClose={() => setEditor(null)}
          onSaved={(view) => {
            setPendingExpand(view.id)
            void refresh()
            setEditor(null)
          }}
          onChanged={() => void refresh()}
        />
      )}
      {connections.length === 0 ? (
        <div className="db-empty">还没有连接。点击「＋ 新建」添加 PostgreSQL / MySQL / MongoDB / SQLite / 达梦 连接。</div>
      ) : (
        <div className="db-nav-list">
          {connections.map((conn) => (
            <Fragment key={conn.id}>
              <div
                className={`db-conn-row${expandedId === conn.id ? ' db-conn-active' : ''}`}
                onClick={() => toggle(conn)}
                title={`${conn.name} · ${TYPE_LABELS[conn.type]}${conn.lastError ? ` · 上次测试失败：${conn.lastError}` : ''} —— 点击展开对象树`}
              >
                <span className="db-conn-caret">{expandedId === conn.id ? '▾' : '▸'}</span>
                <span className="db-grow db-conn-name">{conn.name}</span>
                <span className="db-badge db-badge-type">{SHORT[conn.type] ?? conn.type}</span>
                {conn.lastError
                  ? <span className="db-dot db-dot-bad" title={`上次测试失败：${conn.lastError}`} />
                  : conn.lastTestedAt ? <span className="db-dot db-dot-ok" title={`上次测试通过：${conn.lastTestedAt}`} /> : null}
              </div>
              {expandedId === conn.id && (
                <div className="db-tree-host">
                  <div className="db-muted db-tree-hint" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {conn.type === 'sqlite'
                      ? <span className="db-chip">{conn.file}</span>
                      : <span>{conn.host ?? ''}{conn.port ? `:${conn.port}` : ''}{conn.user ? ` · ${conn.user}` : ''}{conn.database ? ` · 库:${conn.database}` : ''}</span>}
                  </div>
                  <ConnTree
                    connection={conn}
                    callbacks={{
                      onOpenBrowse: props.onOpenBrowse,
                      onEdit: openEditor,
                      onDelete: (record) => void handleDelete(record),
                      onCollapse: () => setExpandedId(null),
                    }}
                  />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}
