/**
 * `database.console` slot 注册组件 —— 工作台面板。
 *
 * 渲染 <App/>（含左侧连接导航 + 右侧多 Tab 工作区）。
 *
 * ⚠️ 必须保留 `<div id="dsh-database-console">` 这层 wrapper：styles.css 里所有
 * 选择器都以 `#dsh-database-console` 为根限定（`#dsh-database-console .db-topbar {…}`、
 * `#dsh-database-console * {…}`），没这个 id 整个主题样式全失效。
 *
 * 几何策略：shell.overlay 父节点是 `position: absolute; inset: 0` 覆盖整个 frame
 * （含左右侧栏）。DSH 是三栏 layout —— sidebar | center | details（右侧详情栏可
 * 展开/收起/拖宽）。本组件用 ResizeObserver 分别跟踪：
 *   - `[class*="sidebarCol"]`  —— 左侧栏宽度 → left
 *   - `[class*="detailsCol"]`  —— 右侧详情栏宽度 → right
 * 让面板始终正好盖在 **中栏** 上：左/右侧栏开合与拖宽时自动重排，不再被右侧
 * 详情栏盖住，也不遮挡它的拖拽手柄。
 *
 * 显隐语义（配合 index.tsx 的 shell.overlay host）：
 *   - `hidden` 为 true 时只做 display:none —— App 保持挂载，关闭面板再打开时
 *     所有 Tab / 子视图 / SQL 文本等状态原样保留（不再“每次都重置”）。
 *   - 从未打开过且非 standalone 时由 host 直接不渲染本组件。
 */
import { useEffect, useState } from 'react'
import App from './App.tsx'
import type { DatabaseConsoleOwnerProps } from './contract/slots.d.ts'

export function DatabaseConsoleOverlay(props: DatabaseConsoleOwnerProps): JSX.Element | null {
  const [track, setTrack] = useState<{ left: number; right: number }>({ left: SIDEBAR_FALLBACK_PX, right: 0 })

  // 跟 ui-layout 的三栏几何。layout 注入的 className hash 偶尔会变，但
  // `sidebarCol` / `detailsCol` 这两段是稳定的，所以用 attribute selector 匹配。
  useEffect(() => {
    if (typeof document === 'undefined') return
    const sidebar = document.querySelector<HTMLElement>('[class*="sidebarCol"]')
    const details = document.querySelector<HTMLElement>('[class*="detailsCol"]')
    if (sidebar === null && details === null) return
    const update = (): void => {
      setTrack({
        left: sidebar !== null ? sidebar.getBoundingClientRect().width : SIDEBAR_FALLBACK_PX,
        right: details !== null ? details.getBoundingClientRect().width : 0,
      })
    }
    update()
    const ro = new ResizeObserver(update)
    if (sidebar !== null) ro.observe(sidebar)
    if (details !== null) ro.observe(details)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      id="dsh-database-console"
      data-hidden={props.hidden ? 'true' : undefined}
      style={{
        position: 'absolute',
        left: Math.max(0, Math.round(track.left)),
        top: 0,
        right: Math.max(0, Math.round(track.right)),
        bottom: 0,
        background: 'var(--db-bg)',
        display: props.hidden ? 'none' : 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      <App onClose={props.onClose} standalone={props.standalone} />
    </div>
  )
}

/** 用户拉窄视口到 narrow 模式时 layout 折叠 sidebar 到窄 rail；这个值与
 *  createLayoutStore 默认值（280px）一起取最坏情况下的回退。 */
const SIDEBAR_FALLBACK_PX = 280
