/**
 * 面板开关控制器（纯 JS，无 React）：驱动侧边栏入口高亮与中栏面板可见性。
 * 在 slot 模型下不再做属性 + 全局事件互斥 —— 由 shell.overlay 浮层
 * 直接管理可见性，controller 退化为单例的开关 + 订阅器。
 *
 * 打开状态会写入 localStorage：刷新页面后恢复上次是否打开工作台
 * （内容恢复见 App：恢复上次连接焦点）。
 */
import { useSyncExternalStore } from 'react'
import { readPersist, writePersist } from './persist.ts'

export const PANEL_NAME = 'database'

export interface PanelController {
  open(): void
  close(): void
  toggle(): void
  getSnapshot(): PanelSnapshot
  subscribe(listener: () => void): () => void
  setActiveConnection(id: string | null): void
}

let panelOpen = readPersist().panelOpen === true
let activeConnectionId: string | null = null
const listeners = new Set<() => void>()
const emit = (): void => {
  for (const listener of listeners) listener()
}

/**
 * ⚠️ 必须缓存同一个引用给 useSyncExternalStore：
 * React 用 `Object.is` 比对相邻两次 getSnapshot 的返回值，每次新建对象
 * 会让 React 永远认为状态变了，进入无限重渲染循环（minified error #185）。
 */
interface PanelSnapshot {
  readonly panelOpen: boolean
  readonly activeConnectionId: string | null
}
const SNAPSHOT_OPEN: PanelSnapshot = Object.freeze({ panelOpen: true, activeConnectionId: null })
const SNAPSHOT_CLOSED: PanelSnapshot = Object.freeze({ panelOpen: false, activeConnectionId: null })
let currentSnapshot: PanelSnapshot = panelOpen ? SNAPSHOT_OPEN : SNAPSHOT_CLOSED
const rebuildSnapshot = (): void => {
  // 用最少的两个 immutable 快照复用：open/closed 切换时换另一个常量对象。
  currentSnapshot = panelOpen ? SNAPSHOT_OPEN : SNAPSHOT_CLOSED
}
const rememberOpen = (): void => {
  try {
    writePersist({ panelOpen })
  } catch {
    /* 忽略 */
  }
}

export const controller: PanelController = {
  open() {
    if (panelOpen) return
    panelOpen = true
    rebuildSnapshot()
    rememberOpen()
    emit()
  },
  close() {
    if (!panelOpen) return
    panelOpen = false
    rebuildSnapshot()
    rememberOpen()
    emit()
  },
  toggle() {
    panelOpen = !panelOpen
    rebuildSnapshot()
    rememberOpen()
    emit()
  },
  getSnapshot: () => currentSnapshot,
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  setActiveConnection(id) {
    if (activeConnectionId === id) return
    activeConnectionId = id
    rebuildSnapshot()
    emit()
  },
}

/**
 * React 端订阅 controller 状态的 hook。组件只需在 render 期间调一次，
 * 返回的 snapshot 是 controller 当前状态的不可变快照。
 */
export function usePanelSnapshot(): { panelOpen: boolean; activeConnectionId: string | null } {
  return useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  )
}
