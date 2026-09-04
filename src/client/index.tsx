/**
 * dsh-database-console 客户端插件入口（浏览器端）。
 *
 * 通过 window.__ModuleLoader__ 注册为 web 平台客户端模块。DSH 客户端加载器
 * 拿到 module 后用 cordis ctx.plugin() 驱动 apply(ctx)。
 *
 * 我们的 apply 负责通过 ctx.slots + ctx.locale 把插件挂进 DSH 自己的渲染树：
 *
 *   1) `sidebar.footer.action`  list slot   —— 数据库工作台的入口按钮
 *   2) `database.console`       single root  —— 工作台主面板（自定义 slot）
 *   3) `shell.overlay`          list root    —— 把 `database.console` 嵌进 layout
 *                                                声明的 frame-wide 浮层
 *
 * React/ReactDOM 留作 external —— 见 build.mjs 的 `external: [...]`。这让
 * esbuild 不会把第二份 React 整包内联进来；组件的 hooks 走的是 DSH 主机的那份
 * React dispatcher，不会再抛 "Cannot read properties of null (reading
 * 'useSyncExternalStore')"。
 */
import { useEffect, useRef } from 'react'
import { DatabaseSidebarEntry } from './db-sidebar-entry.tsx'
import { DatabaseConsoleOverlay } from './db-console-overlay.tsx'
import { ensureThemeStyle } from './theme.ts'
import { controller, usePanelSnapshot } from './controller.ts'
import { zh, en, NS } from './locales.ts'
import type { DatabaseConsoleOwnerProps } from './contract/slots.d.ts'
import cssText from './styles.css'

export const inject: string[] = ['slots', 'locale']

/* ------------------------------------------- shell.overlay 宿主组件 */

/**
 * shell.overlay 列表槽位的 entry。layout 的 <ShellOverlayOutlet/> 替我们把这个组件
 * 渲染进 frame-wide portal，框架通过 props.renderSlot 注入子 slot 渲染器。
 * 我们负责声明并渲染 `database.console` 这个 single root slot。
 *
 * 首次打开后保持挂载（host 不再卸载子 slot）：关闭面板时把 `hidden` 透传给
 * DatabaseConsoleOverlay（display:none），App 及其全部 Tab 状态因此跨“关闭再打开”
 * 保留；这对“每次打开数据库弹出内容需保持上次状态”至关重要。
 */
interface ShellOverlayHostProps {
  renderSlot: (key: 'database.console', owner: DatabaseConsoleOwnerProps) => JSX.Element | null
  /** 是否处于独立预览模式（独立预览时也走这里）。 */
  standalone?: boolean
}

function DatabaseShellOverlayHost({ renderSlot, standalone = false }: ShellOverlayHostProps): JSX.Element | null {
  const snapshot = usePanelSnapshot()
  const everOpened = useRef(false)
  useEffect(() => {
    if (snapshot.panelOpen) everOpened.current = true
  }, [snapshot.panelOpen])
  // 从未打开过 → 什么都不渲染；打开过一次后保持渲染，仅切换可见性。
  if (!snapshot.panelOpen && !standalone && !everOpened.current) return null
  const visible = snapshot.panelOpen || standalone
  return renderSlot('database.console', {
    onClose: () => controller.close(),
    standalone,
    hidden: !visible,
  })
}

/* ----------------------------------------------------- plugin apply */

export function apply(ctx?: ClientCtx): void {
  const slots = ctx?.slots
  const locale = ctx?.locale
  if (!slots || !locale) {
    // 没有 slots/locale 时回退到独立预览（保持旧路径可用）
    if (typeof document !== 'undefined') {
      ctx?.effect?.(() => standalonePreview(), 'dsh-database-console: standalone preview')
    }
    return
  }

  const t = locale.bind(NS) as unknown as (key: keyof typeof zh) => string

  // 1) locale 注册：保证 sidebar/overlay 文案随 zh/en 切换而变化。
  const disposeLocale = locale.register(NS, { zh, en })

  // 2) 主题样式单例（一个 <style> tag，重复进入幂等）。
  const disposeStyle = ensureThemeStyle()

  // 3) 侧边栏底部按钮 —— `sidebar.footer.action` list slot 的一个新 entry。
  //    ⚠️ 必须把组件函数本身传给 slots.register，不能包 lambda 再调它一次：
  //    slot renderer 通过 `react_jsx_runtime.jsx(Comp, props)` 把 Comp 挂进自己的 fiber；
  //    如果我们外面包一层 `(p) => DatabaseSidebarEntry(p)`，React 调 lambda 时
  //    currentlyRenderingFiber 还是它自己的，但 lambda 立刻把 DatabaseSidebarEntry
  //    当成普通函数调，此时 hooks 在 React 没有为它建立 fiber 的情况下执行，
  //    useSyncExternalStore 会读 null 抛 "Cannot read properties of null"。
  //    order: -10 让我们排在 dsh 自带的 cordis-panel（默认 0）和 web-all 的
  //    remote-web-ui（默认 0）之前，作为 footer 第一个 entry。
  const disposeSidebar = slots.inject('sidebar.footer.action', () => {
    return slots.register(
      {
        name: 'sidebar.footer.action',
        id: 'database',
        order: -10,
        locale: NS,
        label: () => t('sidebar.label'),
      },
      DatabaseSidebarEntry as unknown as (p: Record<string, unknown>) => unknown,
    )
  })

  // 4) 工作台主面板 —— 自定义 `database.console`（single / scope: root）槽位。
  //    任何插件都可以注入它来替换默认实现，或注册到子 slot `database.console.toolbar`
  //    在工作台顶部添加按钮（子槽位声明见 children）。
  const disposeConsole = slots.inject('database.console', () => {
    return slots.register(
      {
        name: 'database.console',
        id: 'dsh',
        order: 0,
        locale: NS,
        label: () => t('sidebar.aria'),
        children: {
          'database.console.toolbar': { kind: 'list', scope: 'root' },
        },
      },
      DatabaseConsoleOverlay as unknown as (p: Record<string, unknown>) => unknown,
    )
  })

  // 5) shell.overlay 宿主 —— 把 `database.console` 嵌进 layout 已声明的浮层。
  const disposeOverlay = slots.inject('shell.overlay', () => {
    return slots.register(
      {
        name: 'shell.overlay',
        id: 'database.console',
        order: 60,
        locale: NS,
        label: () => t('sidebar.aria'),
        // ⚠️ 必须声明 children —— DSH 渲染器**只**在 entry 有 children 时才把
        // `renderSlot` prop 注入到 host 组件；没声明时 renderSlot 是 undefined，
        // 调用 renderSlot('database.console', owner) 会抛 "t is not a function"。
        // 这里把 `database.console` 声明成 shell.overlay 的子槽位，host 调用
        // renderSlot('database.console', owner) 时渲染器会找到我们上面用
        // disposeConsole 注册的 DatabaseConsoleOverlay，并把 owner 透传下去。
        children: {
          'database.console': { kind: 'single', scope: 'root' },
        },
      },
      DatabaseShellOverlayHost as unknown as (p: Record<string, unknown>) => unknown,
    )
  })

  // 6) 卸载级联
  if (ctx?.effect) {
    ctx.effect(() => () => {
      disposeLocale()
      disposeSidebar()
      disposeConsole()
      disposeOverlay()
      disposeStyle()
    }, 'dsh-database-console: plugin teardown')
  }
}

/* ---------------------------------------------------------- 独立预览 */

function standalonePreview(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById('dsh-database-standalone-button') !== null) return
  // 主题样式
  ensureThemeStyle()
  // 浮动按钮
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
}

const globalScope = globalThis as unknown as { window?: Window & { __ModuleLoader__?: { load(options: { id: string; factory: (require: unknown) => unknown }): unknown } }; document?: Document }

// 独立预览路径：没有 __ModuleLoader__ 时，DOM 就绪后自举一个浮动按钮。
// 在 DSH 主机里，__ModuleLoader__ 一定存在；构建产物的 banner 已经把
// `window.__ModuleLoader__.load({ id, factory })` 提前包好（见 build.mjs），
// 所以下面这段 if 分支只在脱离 DSH 跑 demo 时生效。
if (!globalScope.window?.__ModuleLoader__ && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => standalonePreview(), { once: true })
  } else {
    standalonePreview()
  }
}

/* ------------------------------------------------- Client context types */

interface ClientCtx {
  slots?: {
    inject(key: string, cb: () => unknown): () => void
    register(opts: Record<string, unknown>, component: unknown): () => void
  }
  locale?: {
    bind(ns: string): (key: string) => string
    register(ns: string, dicts: { zh: Record<string, string>; en: Record<string, string> }): () => void
  }
  effect?(cb: () => unknown, label?: string): void
}

export { cssText }