/**
 * 面板开关控制器（纯 JS，无 React）：驱动侧边栏入口高亮与中栏面板可见性。
 * 与 dsh-ssh / dsh-task-board 采用相同的 html[data-*] + 事件协议，避免多面板互踩。
 */

export const PANEL_NAME = 'database'
export const ACTIVE_ATTR = 'data-dsh-database-active'
export const VIEW_SELECTOR = '[data-dsh-database-view]'
export const ENTRY_SELECTOR = '[data-dsh-database-entry]'
/** 兄弟面板激活时的事件名（见 dsh-ssh mount.tsx）。 */
export const ACTIVATE_EVENT = 'dsh-panel-activate'
/** 其它单占用面板的激活属性，打开本面板时必须摘掉。 */
export const OTHER_ACTIVE_ATTRS = ['data-dsh-taskboard-active', 'data-dsh-ssh-active']
/** 侧边栏点击会交还对话的面板类型（ssh/taskboard 都这么做）。 */
export const OTHER_PANEL_NAMES = ['taskboard', 'ssh']

export interface PanelController {
  open(): void
  close(): void
  toggle(): void
  getSnapshot(): { panelOpen: boolean }
  subscribe(listener: () => void): () => void
}

let panelOpen = false
const listeners = new Set<() => void>()
const emit = (): void => {
  for (const listener of listeners) listener()
}

export const controller: PanelController = {
  open() {
    if (panelOpen) return
    panelOpen = true
    emit()
  },
  close() {
    if (!panelOpen) return
    panelOpen = false
    emit()
  },
  toggle() {
    panelOpen = !panelOpen
    emit()
  },
  getSnapshot: () => ({ panelOpen }),
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

/** 打开面板并驱逐兄弟面板（属性 + 全局事件双通道）。 */
export function activatePanel(): void {
  const html = document.documentElement
  for (const attr of OTHER_ACTIVE_ATTRS) html.removeAttribute(attr)
  html.setAttribute(ACTIVE_ATTR, '')
  document.dispatchEvent(new CustomEvent(ACTIVATE_EVENT, { detail: PANEL_NAME }))
}

export function deactivatePanel(): void {
  document.documentElement.removeAttribute(ACTIVE_ATTR)
}

/** 其它面板激活事件：把我们关掉。 */
export function onOtherPanelActivate(event: Event): void {
  const name = (event as CustomEvent).detail
  if (typeof name === 'string' && OTHER_PANEL_NAMES.includes(name) && controller.getSnapshot().panelOpen) {
    controller.close()
  }
}
