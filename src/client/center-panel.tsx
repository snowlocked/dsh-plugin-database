/**
 * 中栏面板挂载：在中心列（conversation/centerCol）追加我们的容器并渲染 <App/>，
 * 可见性走 html[data-dsh-database-active] 全局 CSS；与 task-board/ssh 面板互斥，
 * 侧边栏点击会话行时自动关闭把中栏还给对话。
 */
import { createRoot, type Root } from 'react-dom/client'
import App from './App.tsx'
import { ensureThemeStyle } from './theme.ts'
import {
  ACTIVATE_EVENT,
  activatePanel,
  controller,
  deactivatePanel,
  onOtherPanelActivate,
} from './controller.ts'

const COLUMN_SELECTOR = '[data-pane="conversation"], [class*="centerCol"]'

function conversationColumn(): HTMLElement | undefined {
  return document.querySelector<HTMLElement>(COLUMN_SELECTOR) ?? undefined
}

/** 侧边栏点击这些行 = 用户回到对话，面板应当关闭。 */
const SIDEBAR_ROW_SELECTOR = [
  '[class*="sessionRow"]',
  '[class*="projectRow"]',
  '[class*="searchResultRow"]',
  '[class*="searchResultWorkspace"]',
  '[class*="newSession"]',
].join(', ')

export function mountCenterPanel(): () => void {
  let root: Root | undefined
  let container: HTMLDivElement | undefined

  const ensure = (): void => {
    if (container !== undefined) {
      if (container.isConnected) return
      root?.unmount()
      root = undefined
      container.remove()
      container = undefined
    }
    const column = conversationColumn()
    if (column === undefined) return
    container = document.createElement('div')
    container.id = 'dsh-database-console'
    container.dataset.dshDatabaseView = ''
    container.dataset.dshPlugin = 'database'
    container.dataset.dshPart = 'panel-view'
    column.appendChild(container)
    ensureThemeStyle()
    root = createRoot(container)
    root.render(
      <App
        onClose={() => controller.close()}
        standalone={false}
      />,
    )
  }

  const waitObserver = new MutationObserver(() => ensure())
  waitObserver.observe(document.body, { childList: true, subtree: true })

  const applyActive = (): void => {
    if (controller.getSnapshot().panelOpen) activatePanel()
    else deactivatePanel()
  }

  const onClickSidebarRow = (event: MouseEvent): void => {
    if (!controller.getSnapshot().panelOpen) return
    const target = event.target as HTMLElement | null
    if (target === null) return
    if (target.closest(SIDEBAR_ROW_SELECTOR) !== null) controller.close()
  }

  document.addEventListener('click', onClickSidebarRow, true)
  document.addEventListener(ACTIVATE_EVENT, onOtherPanelActivate)
  const unsubscribe = controller.subscribe(applyActive)
  applyActive()
  ensure()

  return () => {
    document.removeEventListener('click', onClickSidebarRow, true)
    document.removeEventListener(ACTIVATE_EVENT, onOtherPanelActivate)
    waitObserver.disconnect()
    unsubscribe()
    deactivatePanel()
    root?.unmount()
    root = undefined
    container?.remove()
    container = undefined
  }
}
