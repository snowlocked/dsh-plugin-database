/**
 * `database.console` slot 注册组件 —— 工作台面板。
 *
 * 渲染 <App/>（含左侧连接导航 + 右侧多 Tab 工作区）。
 *
 * ⚠️ 必须保留 `<div id="dsh-database-console">` 这层 wrapper：styles.css 里所有
 * 选择器都以 `#dsh-database-console` 为根限定（`#dsh-database-console .db-topbar {…}`、
 * `#dsh-database-console * {…}`），没这个 id 整个主题样式全失效。
 *
 * 几何策略（自适应页面宽度，参考 dsh-plugins-team-board 番茄工作台的中栏接管思路）：
 * shell.overlay 父节点是 `position: absolute; inset: 0` 覆盖整个 frame（含左右侧栏）。
 * DSH 是三栏 layout —— sidebar | center | details（右侧详情栏可展开/收起/拖宽）。
 * 本组件持续跟踪两列的真实宽度，让面板始终正好盖在 **中栏** 上：
 *   - `[class*="sidebarCol"]`  —— 左侧栏宽度 → left（折叠/窄屏 rail/拖宽都跟随）
 *   - `[class*="detailsCol"]`  —— 右侧详情栏宽度 → right
 * 与旧版「挂载时一次性 querySelector」不同，列节点失联（layout 重挂载、热更新、
 * class hash 变化）时会自动重新解析并重新观察；frame 尺寸与窗口 resize 也触发重测，
 * 因此任意页面宽度下面板都贴合中栏。找不到列节点（如独立预览）时左右均为 0，
 * 面板铺满可用宽度。
 *
 * 点击外部自动关闭（同番茄工作台的 closeOnOutsideNavigation）：面板打开时在
 * document 捕获阶段监听 pointerdown，点在面板外（左侧栏其它插件按钮、右侧详情栏、
 * shell 自身控件）即收起工作台。以下目标不触发关闭：
 *   - 面板内部（root.contains）；
 *   - portal 弹层：[role="dialog"] / [role="menu"] / [role="listbox"]；
 *   - 本插件自己的侧边栏入口按钮（[data-d-sh-plugin="database"]）—— 它自带
 *     toggle 语义，若在这里先 close，随后的 click toggle 会把面板重新打开。
 *
 * 显隐语义（配合 index.tsx 的 shell.overlay host）：
 *   - `hidden` 为 true 时只做 display:none —— App 保持挂载，关闭面板再打开时
 *     所有 Tab / 子视图 / SQL 文本等状态原样保留（不再“每次都重置”）。
 *   - 从未打开过且非 standalone 时由 host 直接不渲染本组件。
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import App from './App.tsx'
import type { DatabaseConsoleOwnerProps } from './contract/slots.d.ts'

/** 左右两栏的实测宽度；找不到列节点时按 0 处理（面板铺满可用宽度）。 */
interface ColumnTrack { left: number; right: number }

export function DatabaseConsoleOverlay(props: DatabaseConsoleOwnerProps): JSX.Element | null {
  const [track, setTrack] = useState<ColumnTrack>({ left: 0, right: 0 })
  const rootRef = useRef<HTMLDivElement | null>(null)
  // 宿主每次渲染都会新建 onClose；放进 latest-ref 让两个 effect 的依赖保持稳定。
  const onCloseRef = useRef(props.onClose)
  onCloseRef.current = props.onClose
  const visible = !props.hidden

  // ---- 几何跟踪：面板始终贴合中栏（左让开 sidebarCol，右让开 detailsCol）----
  useLayoutEffect(() => {
    if (typeof document === 'undefined') return
    let sidebarCol: HTMLElement | null = null
    let detailsCol: HTMLElement | null = null
    let raf = 0

    const schedule = (): void => {
      if (raf !== 0) return
      raf = requestAnimationFrame(() => {
        raf = 0
        measure()
      })
    }

    // 列节点失联（layout 重挂载/热更新/class hash 变化）时重新解析并重新观察。
    const resolveColumns = (): void => {
      if (sidebarCol === null || !sidebarCol.isConnected) {
        sidebarCol = document.querySelector<HTMLElement>('[class*="sidebarCol"]')
        if (sidebarCol !== null) ro.observe(sidebarCol)
      }
      if (detailsCol === null || !detailsCol.isConnected) {
        detailsCol = document.querySelector<HTMLElement>('[class*="detailsCol"]')
        if (detailsCol !== null) ro.observe(detailsCol)
      }
    }

    const measure = (): void => {
      resolveColumns()
      const left = sidebarCol !== null ? sidebarCol.getBoundingClientRect().width : 0
      const right = detailsCol !== null ? detailsCol.getBoundingClientRect().width : 0
      setTrack((previous) => (
        Math.abs(previous.left - left) < 0.5 && Math.abs(previous.right - right) < 0.5
          ? previous // 无实际变化不触发重渲染（拖拽期间 RO 回调很密）
          : { left: Math.max(0, left), right: Math.max(0, right) }
      ))
    }

    const ro = new ResizeObserver(schedule)
    measure()
    // 帧根（grid frame）尺寸变化（窗口缩放、滚动条出现等）也要重测：
    // 列节点被整体替换时 ResizeObserver 自己不会发现，这里顺带完成重新解析。
    const frame = rootRef.current?.closest<HTMLElement>('[class*="frame"]')
      ?? rootRef.current?.parentElement
    if (frame !== null && frame !== undefined) ro.observe(frame)
    // 保险：个别环境下 frame RO 可能不触发（如宿主非窗口铺满），再挂一层窗口监听。
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('resize', schedule)
      ro.disconnect()
      if (raf !== 0) cancelAnimationFrame(raf)
    }
  }, [])

  // ---- 点击面板外自动关闭（左侧菜单其它插件按钮、右栏、shell 控件等）----
  useEffect(() => {
    if (!visible || props.standalone) return
    const onPointerDown = (event: PointerEvent): void => {
      if (!(event.target instanceof Element)) return
      const root = rootRef.current
      if (root === null) return
      if (root.contains(event.target)) return
      if (event.target.closest('[role="dialog"], [role="menu"], [role="listbox"]')) return
      if (event.target.closest('[data-d-sh-plugin="database"]')) return
      onCloseRef.current()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [visible, props.standalone])

  return (
    <div
      id="dsh-database-console"
      ref={rootRef}
      data-hidden={props.hidden ? 'true' : undefined}
      style={{
        position: 'absolute',
        left: Math.max(0, Math.round(track.left)),
        top: 0,
        right: Math.max(0, Math.round(track.right)),
        bottom: 0,
        background: 'var(--db-bg)',
        display: props.hidden ? 'none' : 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      <App onClose={props.onClose} standalone={props.standalone} />
    </div>
  )
}
