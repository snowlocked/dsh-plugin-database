/**
 * `database.console` slot 注册组件 —— 工作台面板。
 *
 * 原 `center-panel.tsx` 自己挑列、自己挂载、自己互斥兄弟面板；
 * 现在切到 slot 模型：占位的是 layout 的 `shell.overlay`（frame-wide 浮层，
 * 已在 ui-layout 注册、key 为 `shell.overlay`）。我们只声明并注册
 * `database.console` 这一个 single root-scope slot，然后由 `index.tsx`
 * 在 `shell.overlay` 里 renderSlot('database.console')。
 *
 * 渲染本身仍是原 <App/>（提供独立 onClose、standalone 标记）；
 * 本组件是 React 树：controller 订阅 → 显隐 → 把 onClose 透传给 App。
 */
import { useEffect, useState, useSyncExternalStore } from 'react'
import { controller } from './controller.ts'
import App from './App.tsx'
import type { DatabaseConsoleOwnerProps } from './contract/slots.d.ts'

/**
 * 同 DatabaseSidebarEntry 的注意事项 —— 直接以函数组件形式传给 slot.register，
 * 不要在外面再套一层 `(props) => DatabaseConsoleOverlay(props)` 的 lambda，
 * 否则 hooks 会在 React render context 外被调用而抛 null。
 *
 * ⚠️ 必须保留 `<div id="dsh-database-console">` 这层 wrapper：styles.css 里 88 条
 * 选择器都以 `#dsh-database-console` 为根限定（`#dsh-database-console .db-topbar {…}`、
 * `#dsh-database-console * {…}`），没这个 id 整个主题样式全失效。
 * 旧 `center-panel.tsx` 自己 createRoot 到这个 div；切到 slot 之后 wrapper 由
 * 本组件提供，slot 渲染器（`react_jsx_runtime.jsx(Comp, props)`）把我们的返回值
 * 直接挂进 `shell.overlay` 的 React 树。
 *
 * `shell.overlay` 节点本身是 `position: absolute; inset: 0` 覆盖整个 frame（含
 * 侧边栏）。我们手动把 wrapper 限制在「侧栏之后」并撑满高度；用 ResizeObserver
 * 跟 `.pI_x6G_sidebarCol` 的实际宽度——用户拖动侧栏时跟着重排。
 */
export function DatabaseConsoleOverlay(props: DatabaseConsoleOwnerProps): JSX.Element | null {
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  )
  const [sidebarWidth, setSidebarWidth] = useState<number>(SIDEBAR_FALLBACK_PX)

  // 跟 ui-layout 的 sidebar 列宽。layout 注入的 className hash 偶尔会变，但
  // `sidebarCol` 这一段是稳定的，所以用 attribute selector 匹配。
  useEffect(() => {
    if (typeof document === 'undefined') return
    const sidebar = document.querySelector<HTMLElement>('[class*="sidebarCol"]')
    if (sidebar === null) return
    const update = (): void => {
      const rect = sidebar.getBoundingClientRect()
      if (rect.width > 0) setSidebarWidth(rect.width)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(sidebar)
    return () => ro.disconnect()
  }, [])

  if (!snapshot.panelOpen && !props.standalone) return null
  return (
    <div
      id="dsh-database-console"
      style={{
        // shell.overlay 父节点已 `position: absolute; inset: 0` 覆盖整个 frame。
        // 我们手动把 wrapper 推到侧栏右边、贴顶贴底、背景色填满、纵向滚动。
        position: 'absolute',
        left: sidebarWidth,
        top: 0,
        right: 0,
        bottom: 0,
        background: 'var(--db-bg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        zIndex: 1,
      }}
    >
      <App onClose={props.onClose} standalone={props.standalone} />
    </div>
  )
}

/** 用户拉窄视口到 narrow 模式时 layout 折叠 sidebar 到 56px rail；这个值与
 *  createLayoutStore 默认值（280px）一起取最坏情况下的回退。 */
const SIDEBAR_FALLBACK_PX = 280