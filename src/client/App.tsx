/**
 * dsh-database-console 工作台根组件。
 *
 * 布局（工具型 IDE 风格）：
 *
 *   ┌──────────────────────────────────────────────────────┐
 *   │ topbar：标题 + 状态 + 关闭/回到对话                      │
 *   ├──────────────┬───────────────────────────────────────┤
 *   │ 左侧导航       │ 右侧 Tab 工作区                        │
 *   │ （连接管理 +   │  TabBar（横向滚动 / 可关闭 / 复用）      │
 *   │  连接对象树）  │  Tab 内容 = 一张表的工作区：            │
 *   │               │    · 📚 数据浏览  · ⌨️ SQL 查询         │
 *   │               │    · 💬 自然语言查询                    │
 *   └──────────────┴───────────────────────────────────────┘
 *
 * 行为约定：
 *   - 点表/视图/集合 → 打开或激活“该表的工作区 Tab”；
 *     再次点同一个对象 = 定位到已打开的 Tab（不新建）。
 *   - 每个 Tab 内含「数据浏览 / SQL 查询 / 自然语言查询」三个子页，
 *     各自保持独立状态。
 *   - Tab 可关闭；Tab 过多时 TabBar 横向滚动。
 *   - 已打开 Tab 保持挂载（隐藏而非卸载）→ 关闭面板再打开、切换 Tab
 *     都不丢状态。
 *   - 轻量恢复：面板打开状态由 controller 持久化；这里把「上次使用的连接」
 *     持久化并在刷新后交给左侧导航自动定位。
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { dbApi } from './client.ts'
import type { ConnectionView } from './client.ts'
import { readPersist, writePersist } from './persist.ts'
import { ConnectionSidebar } from './sidebar.tsx'
import { TableWorkspace } from './panes.tsx'
import type { BrowseTarget } from './target.ts'

export interface AppProps {
  /** 提供时在顶栏显示“关闭/回到对话”按钮 */
  onClose?: () => void
  /** 独立预览模式（无 DSH 中栏） */
  standalone?: boolean
}

/* ------------------------------------------------------------------ Tab 模型 */

/**
 * 打开项 = 「一张表/视图/集合的工作区」。点击同一张表只会激活已有 Tab；
 * Tab 内容为一个三子页工作区：数据浏览 / SQL 查询 / 自然语言查询（见 panes.tsx）。
 */
type TabModel = { key: string; kind: 'browse'; connId: string; title: string; sub: string; target: BrowseTarget }

const KIND_ICON: Record<string, string> = { view: '👁', collection: '📦', table: '🗂' }

function browseKey(conn: ConnectionView, target: BrowseTarget): string {
  return `browse:${conn.id}|${target.database ?? ''}|${target.schema ?? ''}|${target.table.name}`
}

function browseSub(conn: ConnectionView, target: BrowseTarget): string {
  const parts = [conn.name, target.database, target.schema, target.table.name].filter(Boolean)
  return parts.join(' · ')
}

export default function App(props: AppProps = {}) {
  const [connections, setConnections] = useState<ConnectionView[]>([])
  const [busyList, setBusyList] = useState(false)
  const [status, setStatus] = useState({ level: 'info', text: '加载中…' })
  const firstRun = useRef(true)
  // 刷新后要自动定位的连接（从 localStorage 恢复，仅当它仍存在时生效）
  const savedFocus = useRef<string | null>(readPersist().lastConnId ?? null)
  const [focusId, setFocusId] = useState<string | null>(null)

  // 右侧打开项：顺序即 Tab 顺序；已打开的 key 不重复创建
  const [tabs, setTabs] = useState<TabModel[]>([])
  const [activeKey, setActiveKey] = useState<string | null>(null)

  const rememberConn = useCallback((connId: string): void => {
    try {
      writePersist({ lastConnId: connId })
    } catch {
      /* 忽略 */
    }
  }, [])

  const refresh = useCallback(async (): Promise<void> => {
    setBusyList(true)
    try {
      const { connections: list } = await dbApi.connections()
      setConnections(list)
      // 只读恢复：连接仍在列表里才做焦点定位
      if (savedFocus.current && list.some((entry) => entry.id === savedFocus.current)) {
        setFocusId(savedFocus.current)
        savedFocus.current = null
      }
      // 被删除的连接：关掉其所有 Tab，并保证 active 仍指向存在的 Tab
      const kept = tabs.filter((tab) => list.some((entry) => entry.id === tab.connId))
      if (kept.length !== tabs.length) {
        setTabs(kept)
        setActiveKey((current) => {
          if (current !== null && kept.some((tab) => tab.key === current)) return current
          return kept.length > 0 ? kept[kept.length - 1]!.key : null
        })
      }
      if (list.length === 0) setStatus({ level: 'info', text: '尚未配置连接' })
      else setStatus({ level: 'info', text: `${list.length} 个连接已加载` })
    } catch (reason) {
      const text = reason instanceof Error ? reason.message : String(reason)
      setStatus({ level: 'error', text: `加载连接列表失败：${text}（请确认插件已在 DSH 中启用）` })
    } finally {
      setBusyList(false)
    }
  }, [tabs])

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      void refresh()
    }
  }, [refresh])

  /** 打开/激活一个 Tab；已有同 key 则只激活。 */
  const openTab = useCallback((next: TabModel): void => {
    setTabs((previous) => (previous.some((tab) => tab.key === next.key) ? previous : [...previous, next]))
    setActiveKey(next.key)
    rememberConn(next.connId)
  }, [rememberConn])

  const openBrowse = useCallback((conn: ConnectionView, target: BrowseTarget): void => {
    openTab({
      key: browseKey(conn, target),
      kind: 'browse',
      connId: conn.id,
      title: target.table.name,
      sub: browseSub(conn, target),
      target,
    })
  }, [openTab])

  const closeTab = useCallback((key: string): void => {
    setActiveKey((current) => {
      if (current !== key) return current
      // 关闭的是当前 Tab → 优先激活右侧邻居，否则左侧邻居
      let found = false
      let fallback: string | null = null
      for (const tab of tabs) {
        if (tab.key === key) { found = true; continue }
        if (!found) fallback = tab.key
        else return tab.key
      }
      return fallback
    })
    setTabs((previous) => previous.filter((tab) => tab.key !== key))
  }, [tabs])

  // Tab 内容按 kind 渲染；已打开项一律保持挂载（隐藏而非卸载）
  const renderTab = (tab: TabModel): ReactNode => {
    const conn = connections.find((entry) => entry.id === tab.connId)
    if (!conn) return null
    return <TableWorkspace connection={conn} target={tab.target} />
  }

  const tabIcon = (tab: TabModel): string => KIND_ICON[tab.target.table.kind] ?? '🗂'

  return (
    <div className="db-app">
      <div className="db-topbar">
        <div className="db-title"><span className="db-logo">DB</span> 数据库工作台
          <span className="db-badge db-badge-type">dsh-database-console</span>
        </div>
        <div className="db-grow" />
        {busyList ? <span className="db-muted">…</span> : null}
        {status.level === 'error' ? <span className="db-muted" style={{ color: 'var(--db-err)' }} title={status.text}>⚠️</span> : null}
        {props.onClose ? (
          <button onClick={props.onClose} title="关闭面板，回到对话">
            {props.standalone ? '✕ 关闭' : '✕ 回到对话'}
          </button>
        ) : null}
      </div>

      <div className="db-app-body">
        <ConnectionSidebar
          connections={connections}
          busyList={busyList}
          refresh={refresh}
          focusId={focusId}
          onFocused={rememberConn}
          onOpenBrowse={openBrowse}
        />

        <div className="db-main">
          <div className="db-tabbar" role="tablist" aria-label="已打开的工作区">
            {tabs.length === 0 ? (
              <span className="db-muted" style={{ padding: '0 10px', whiteSpace: 'nowrap' }}>
                从左侧展开连接，点击表/视图/集合打开工作区 Tab（内含 数据浏览 / SQL 查询 / 自然语言查询）。
              </span>
            ) : null}
            {tabs.map((tab) => (
              <div
                key={tab.key}
                role="tab"
                aria-selected={tab.key === activeKey}
                className={`db-tab${tab.key === activeKey ? ' db-tab-active' : ''}`}
                title={`${tab.sub} —— 点击切换，✕ 关闭`}
                onClick={() => setActiveKey(tab.key)}
              >
                <span className="db-tab-icon">{tabIcon(tab)}</span>
                <span className="db-tab-label">{tab.title}</span>
                <span
                  className="db-tab-close"
                  title="关闭"
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tab.key)
                  }}
                >✕</span>
              </div>
            ))}
          </div>

          <div className="db-tabpanes">
            {tabs.length === 0 ? (
              <div className="db-empty" style={{ flex: 1 }}>
                <div>还没有打开任何工作区。</div>
                <div style={{ marginTop: 6, fontSize: 12 }}>
                  左侧点击连接名展开对象树 → 点表/视图/集合打开工作区 Tab；
                  <br />每个 Tab 内含「数据浏览 / SQL 查询 / 自然语言查询」三个子页，各自独立保持状态；
                  <br />重复点击同一张表会定位回它已打开的 Tab。
                </div>
              </div>
            ) : (
              tabs.map((tab) => (
                <div
                  key={tab.key}
                  role="tabpanel"
                  className="db-pane"
                  data-active={tab.key === activeKey ? 'true' : undefined}
                  style={tab.key === activeKey ? undefined : { display: 'none' }}
                >
                  {renderTab(tab)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
