/**
 * 左侧边栏入口（纯 DOM 行，参照 dsh-ssh/task-board 的 shared/sidebar-entry-core）。
 * DSH 侧边栏没有对外 slot，行注入在「新建会话」按钮之后；React 重渲染把行挤掉时由
 * MutationObserver 同帧自愈（先于绘制，无闪烁）。
 */
import { ENTRY_SELECTOR, controller } from './controller.ts'

const ICON = '<svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="7.5" cy="11" rx="5.5" ry="2.75"/><path d="M7.5 11V5.5"/><path d="M2.75 6.25c0-1.1 2.1-2 4.75-2s4.75.9 4.75 2"/><path d="M7.5 8.25c1.9 0 3.4-.45 3.9-1.1M5.25 4.35V3.5"/></svg>'

/** 插件族内兄弟入口的选择器（用于稳定排序）。 */
const FAMILY_SELECTORS = ['[data-dsh-taskboard-entry]', '[data-dsh-ssh-entry]', ENTRY_SELECTOR]

function sidebarRoot(): HTMLElement | undefined {
  const column = document.querySelector<HTMLElement>('[data-pane="sidebar"], [class*="sidebarCol"]')
  if (column === null) return undefined
  const logoOwner = column.querySelector<HTMLElement>('[class*="logoRow"]')?.parentElement
  return logoOwner ?? (column.firstElementChild as HTMLElement | undefined)
}

function newSessionButton(root: HTMLElement): HTMLButtonElement | undefined {
  const nested = root.querySelector<HTMLButtonElement>('button[class*="newSession"]')
  if (nested !== null) return nested
  for (const child of root.children) {
    if (child.tagName === 'BUTTON') return child as HTMLButtonElement
  }
  return undefined
}

function createEntry(): HTMLButtonElement {
  const entry = document.createElement('button')
  entry.type = 'button'
  entry.setAttribute('data-dsh-database-entry', '')
  entry.setAttribute('data-dsh-plugin', 'database')
  entry.setAttribute('data-dsh-part', 'sidebar-entry')
  entry.className = 'db-sidebar-entry'
  entry.setAttribute('aria-label', '数据库工作台')
  entry.setAttribute('title', '数据库工作台')
  const iconSpan = document.createElement('span')
  iconSpan.className = 'db-sidebar-entry-icon'
  iconSpan.innerHTML = ICON
  const labelSpan = document.createElement('span')
  labelSpan.className = 'db-sidebar-entry-label'
  labelSpan.textContent = '数据库'
  entry.append(iconSpan, labelSpan)
  entry.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    controller.toggle()
  })
  return entry
}

function placeEntry(root: HTMLElement, entry: HTMLButtonElement): boolean {
  const button = newSessionButton(root)
  if (button === undefined) return false
  if (entry.parentElement !== root) {
    const row = button.closest('[class*="logoRow"]')
    const base = row !== null && row.parentElement === root ? row : button
    const family = Array.from(root.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el.matches(FAMILY_SELECTORS.join(', ')),
    )
    const anchor = family.length > 0 ? family[family.length - 1]!.nextElementSibling : base.nextElementSibling
    root.insertBefore(entry, anchor)
  }
  return true
}

/** 挂载入口行：等 shell 渲染、自愈、高亮联动。返回移除函数。 */
export function mountSidebarEntry(): () => void {
  if (document.querySelector(ENTRY_SELECTOR) !== null) return () => {}
  const entry = createEntry()
  let root: HTMLElement | undefined
  let placed = false
  let rootObserver: MutationObserver | undefined

  const tryPlace = (): void => {
    if (root !== undefined && !root.isConnected) {
      rootObserver?.disconnect()
      root = undefined
      placed = false
    }
    if (placed) {
      if (document.body.contains(entry)) return
      rootObserver?.disconnect()
      root = undefined
      placed = false
    }
    root ??= sidebarRoot()
    if (root === undefined) return
    placed = placeEntry(root, entry)
    if (placed) {
      rootObserver ??= new MutationObserver(() => {
        if (root === undefined || !root.isConnected) {
          placed = false
          tryPlace()
          return
        }
        if (!root.contains(entry)) {
          placed = placeEntry(root, entry)
        }
      })
      rootObserver.observe(root, { childList: true, subtree: true })
    }
  }

  const waitObserver = new MutationObserver(() => tryPlace())
  waitObserver.observe(document.body, { childList: true, subtree: true })

  const syncActive = (): void => {
    if (controller.getSnapshot().panelOpen) entry.dataset.active = 'true'
    else delete entry.dataset.active
  }
  const unsubscribe = controller.subscribe(syncActive)
  syncActive()
  tryPlace()

  return () => {
    waitObserver.disconnect()
    rootObserver?.disconnect()
    unsubscribe()
    entry.remove()
  }
}
