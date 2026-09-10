/**
 * 面板开关控制器（纯 JS，无 React）：驱动侧边栏入口高亮与中栏面板可见性。
 * 在 slot 模型下不再做属性 + 全局事件互斥 —— 由 conversation.view
 * 的会话级 View 管理渲染位置，controller 保留面板入口的开关状态。
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
  setDocked(value: boolean): void
  getSnapshot(): PanelSnapshot
  subscribe(listener: () => void): () => void
  setActiveConnection(id: string | null): void
}

let panelOpen = readPersist().panelOpen === true
let activeConnectionId: string | null = null
const listeners = new Set<() => void>()

/**
 * Conversation 的 View 选择由宿主维护，插件没有直接暴露的 controller API。
 * 通过宿主已经渲染的 tab button 激活目标 View，避免只切换本地开关而仍停留在 Chat。
 * ⚠️ 必须排除 #dsh-database-console 内部的 role="tab"（工作区 Tab / 子页 Tab），
 * 只匹配 Conversation header 顶层的 View 导航 tab。
 */
const activateConversationView = (view: 'chat' | 'database'): void => {
  if (typeof document === 'undefined') return
  let attempts = 0
  const run = (): void => {
    const tab = Array.from(document.querySelectorAll<HTMLElement>('[role="tab"]'))
      .filter((element) => element.closest('#dsh-database-console') === null)
      .find((element) => {
        const text = element.textContent?.trim().toLowerCase() ?? ''
        const label = `${element.getAttribute('aria-label') ?? ''} ${element.title ?? ''}`.toLowerCase()
        return view === 'database'
          ? text === 'database' || text === '数据库' || label.includes('database') || label.includes('数据库')
          : text === 'chat' || text === '对话' || label.includes('chat') || label.includes('对话')
      })
    if (tab !== undefined) {
      tab.click()
      return
    }
    // View tabs are rendered by Conversation after slot registration. Retry briefly
    // so an entry click also works during the first render/session switch.
    if (++attempts < 8) setTimeout(run, 16)
  }
  run()
}
const emit = (): void => {
  for (const listener of listeners) listener()
}

/**
 * 工作台覆盖层当前是否停靠在 Conversation 根节点上（= 数据库 View 正在前台）。
 * 由 db-console-overlay 的停靠 effect 维护（setDocked），而不是嗅探 DOM ——
 * 刷新后 panelOpen 可能已恢复为 true，但宿主按会话偏好恢复的 View 不一定是
 * database；DOM 嗅探则依赖易变的宿主结构。
 */
let docked = false

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
    if (!panelOpen) {
      panelOpen = true
      rebuildSnapshot()
      rememberOpen()
      emit()
    }
    // Selecting the sidebar entry must also select the Conversation View. This
    // is needed after reload, when panelOpen is restored from localStorage.
    activateConversationView('database')
  },
  close() {
    panelOpen = false
    rebuildSnapshot()
    rememberOpen()
    emit()
    activateConversationView('chat')
  },
  toggle() {
    // 头部被工作台覆盖时（View 导航不可见），侧边栏按钮是唯一常驻的往返入口：
    // 已停靠 → 关闭（切回 Chat）；未停靠 → 打开。
    if (docked) {
      controller.close()
    } else {
      controller.open()
    }
  },
  setDocked(value) {
    docked = value
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
