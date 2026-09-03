/**
 * 数据库工作台侧边栏入口行 —— 作为 `sidebar.footer.action` 列表 slot 的一个 entry 注册：
 *
 *   ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register(
 *     { name: 'sidebar.footer.action', id: 'database', order: 50, locale: NS, label: () => t('sidebar.label') },
 *     DatabaseSidebarEntry,
 *   ))
 *
 * sidebar 包负责「按钮 chrome、列宽/折叠」几何；本组件只渲染内容（图标 + 标签），
 * 点击时调用 controller.toggle()。
 */
import { useCallback, useSyncExternalStore } from 'react'
import { controller } from './controller.ts'
import type { DatabaseTranslate } from './locales.ts'

const ICON = (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <ellipse cx={7.5} cy={11} rx={5.5} ry={2.75} />
    <path d="M7.5 11V5.5" />
    <path d="M2.75 6.25c0-1.1 2.1-2 4.75-2s4.75.9 4.75 2" />
    <path d="M7.5 8.25c1.9 0 3.4-.45 3.9-1.1M5.25 4.35V3.5" />
  </svg>
)

export interface DatabaseSidebarEntryProps {
  /** shell 提供的列宽状态；rail 状态下 sidebar shell 会把 label 视觉隐藏。 */
  wide?: boolean
  /** locale 注入的 t 函数，框架通过 PropsLocale<'sidebar.footer.action'> 传入。 */
  t?: DatabaseTranslate
}

/**
 * Sidebar entry 组件 —— 直接注册到 slot，**不要**在外面再用 lambda 包一层调用
 * 它。slot renderer 会通过 `react_jsx_runtime.jsx(Comp, props)` 把它挂进自己的 React
 * fiber；如果用 lambda 把它先当普通函数执行，hooks 就在 React 尚未把 fiber 当作
 * "rendering fiber" 处理时被调用，导致 `useSyncExternalStore` 抛 null deref。
 */
export function DatabaseSidebarEntry(props: DatabaseSidebarEntryProps): JSX.Element {
  const { wide = true, t = ((key) => key) as unknown as DatabaseTranslate } = props
  const tt = t as DatabaseTranslate
  // 订阅 controller 让激活态跟随面板状态 —— React 端无须自己读写 DOM 属性。
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  )
  const handleClick = useCallback(() => {
    controller.toggle()
  }, [])
  return (
    <button
      type="button"
      data-d-sh-plugin="database"
      data-active={snapshot.panelOpen || undefined}
      aria-label={tt('sidebar.aria')}
      title={tt('sidebar.title')}
      onClick={handleClick}
      className="db-sidebar-entry"
    >
      <span className="db-sidebar-entry-icon" aria-hidden="true">{ICON}</span>
      {wide ? <span className="db-sidebar-entry-label">{tt('sidebar.label')}</span> : null}
    </button>
  )
}