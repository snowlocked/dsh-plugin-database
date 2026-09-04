/**
 * 客户端持久化小件：只在浏览器 localStorage 里保存少量“恢复现场”信息：
 *   - panelOpen：面板上次是否处于打开状态（刷新后自动重新打开工作台）
 *   - lastConnId：上次展开/使用的连接（刷新后自动定位到该连接）
 * Tab 内部的大状态（SQL 文本、浏览分页等）不做跨刷新持久化——
 * 会话内（面板收起/再打开、切子视图）通过“保持挂载”实现，见 overlay/index。
 */
const KEY = 'dsh-database-console.persist.v1'

export interface PersistedState {
  panelOpen?: boolean
  lastConnId?: string | null
}

export function readPersist(): PersistedState {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as PersistedState
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function writePersist(patch: PersistedState): void {
  try {
    const next = { ...readPersist(), ...patch }
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* localStorage 不可用（隐私模式等）时静默忽略 */
  }
}
