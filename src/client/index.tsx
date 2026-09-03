/// <reference path="./client.d.ts" />
/**
 * dsh-database-console 客户端插件入口（浏览器端）。
 *
 * 通过 window.__ModuleLoader__ 注册为 web 平台客户端模块（与 dsh-free-search /
 * tomato-board 相同的契约：bundle 顶层调用 load({id, factory})，factory 返回
 * module 对象 { inject, apply }）。DSH 客户端加载器拿到 module 后用 cordis
 * ctx.plugin() 驱动 apply(ctx)，apply 负责：
 *   1) 侧边栏「数据库」入口行（纯 DOM，带自愈）
 *   2) 中栏面板接管（React 根渲染 <App/>，html[data-dsh-database-active] 显隐）
 * 并在 ctx.effect 上注册销毁逻辑，插件卸载/HMR 时清理。
 *
 * 未运行在 DSH shell（无 __ModuleLoader__）时退化为独立预览：右下角按钮 + 全屏浮层，
 * 便于本地打开 bundle 直接查看面板。
 */
import type {} from 'react'
import { createRoot, type Root } from 'react-dom/client'
import App from './App.tsx'
import { controller } from './controller.ts'
import { mountCenterPanel } from './center-panel.tsx'
import { mountSidebarEntry } from './sidebar-core.ts'
import { ensureThemeStyle } from './theme.ts'
import cssText from './styles.css'

export const inject: string[] = []

interface ClientCtxLike {
  effect?(callback: () => void | (() => void), label?: string): void
}

let mounted = false

/** 执行挂载（幂等）。返回 disposer。 */
function mountAll(): () => void {
  if (mounted) return () => {}
  mounted = true
  const disposers: Array<() => void> = []
  let disposeStyle: (() => void) | undefined
  try {
    disposeStyle = ensureThemeStyle()
    disposers.push(mountSidebarEntry())
    disposers.push(mountCenterPanel())
  } catch (error) {
    console.warn('[dsh-database-console] mount failed (degraded, GUI stays up):', error)
  }
  const dispose = (): void => {
    if (!mounted) return
    mounted = false
    for (const item of disposers.splice(0)) {
      try { item() } catch { /* ignore */ }
    }
    try { disposeStyle?.() } catch { /* ignore */ }
  }
  return dispose
}

/** DSH 客户端插件 apply：ctx 为客户端 cordis 上下文。 */
export function apply(ctx?: ClientCtxLike): void {
  const dispose = mountAll()
  if (ctx && typeof ctx.effect === 'function') {
    ctx.effect(() => dispose, 'dsh-database-console: ui mounts')
  }
}

/* ---------------------------------------------------------------- 独立预览 */

function bootPreview(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById('dsh-database-standalone-button') !== null) return
  let root: Root | undefined
  let overlay: HTMLDivElement | undefined
  let disposeStyle: (() => void) | undefined

  const button = document.createElement('button')
  button.id = 'dsh-database-standalone-button'
  button.textContent = '🗄 数据库工作台'
  button.style.cssText = [
    'position:fixed', 'right:18px', 'bottom:18px', 'z-index:2147483000',
    'background:linear-gradient(135deg,#4c8dff,#7b61ff)', 'color:#fff', 'border:0',
    'border-radius:999px', 'padding:10px 18px', 'font:600 13px/1.4 system-ui,sans-serif',
    'cursor:pointer', 'box-shadow:0 6px 18px rgba(0,0,0,.35)',
  ].join(';')
  button.addEventListener('click', () => controller.toggle())
  document.body.appendChild(button)

  const ensure = (): void => {
    if (overlay !== undefined && overlay.isConnected) return
    if (overlay !== undefined) {
      root?.unmount()
      overlay.remove()
      overlay = undefined
    }
    overlay = document.createElement('div')
    overlay.id = 'dsh-database-standalone-overlay'
    const inner = document.createElement('div')
    inner.id = 'dsh-database-console'
    overlay.appendChild(inner)
    document.body.appendChild(overlay)
    disposeStyle ??= ensureThemeStyle()
    root = createRoot(inner)
    root.render(<App onClose={() => controller.close()} standalone />)
    const render = (): void => {
      if (overlay !== undefined) {
        overlay.style.display = controller.getSnapshot().panelOpen ? 'block' : 'none'
      }
    }
    render()
    const unsubscribe = controller.subscribe(render)
    window.addEventListener('dsh-database-preview-dispose', () => {
      unsubscribe()
      disposeStyle?.()
      disposeStyle = undefined
      root?.unmount()
      root = undefined
      overlay?.remove()
      overlay = undefined
      button.remove()
    })
  }
  ensure()
}

const globalScope = globalThis as unknown as { window?: Window & { __ModuleLoader__?: { load(options: { id: string; factory: (require: unknown) => unknown }): unknown } }; document?: Document }

if (globalScope.window && globalScope.window.__ModuleLoader__) {
  globalScope.window.__ModuleLoader__.load({
    id: 'dsh-database-console',
    factory: () => ({ inject, apply }),
  })
} else {
  // 独立预览：等 DOM 就绪后自举
  const go = (): void => {
    try { apply() } catch (error) {
      console.warn('[dsh-database-console] standalone boot failed:', error)
    }
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => bootPreview(), { once: true })
    } else {
      bootPreview()
    }
  }
}

export { cssText }
