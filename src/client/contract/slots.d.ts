/**
 * dsh-database-console 客户端 slot 契约：
 *
 *   - `database.console` — 由本插件声明、注册的工作台面板入口。
 *     kind: single / scope: root。
 *     工作台默认挂在 `shell.overlay`（layout 提供的全屏浮层）。
 *
 * 该文件只是类型合并；运行时 slot 声明走 register() 的 `children` 字段。
 */
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    /**
     * 数据库工作台主面板。其它插件可注册到 `database.console` 替换默认实现，
     * 或新增 `database.console.foo` 这类子 slot 嵌入工具栏/侧栏。
     * 默认由本插件的 DatabaseConsoleOverlay 组件占位。
     */
    'database.console': {
      kind: 'single'
      scope: 'root'
      owner: DatabaseConsoleOwnerProps
    }
    /** 数据库工具栏附加项列表（嵌入控制台顶部，可用于其它插件添加按钮）。 */
    'database.console.toolbar': {
      kind: 'list'
      scope: 'root'
      owner: DatabaseConsoleToolbarOwnerProps
    }
  }
}

/** `database.console` 注册组件收到的 owner props。 */
export interface DatabaseConsoleOwnerProps {
  /** 关闭面板回调（注册组件自行决定如何响应）。 */
  onClose: () => void
  /** 是否处于独立预览模式（无 DSH shell 时为 true）。 */
  standalone: boolean
  /** 面板已关闭但保持挂载：注册组件应 display:none 而非卸载（状态保留）。 */
  hidden?: boolean
}

/** `database.console.toolbar` 列表项的 owner props。 */
export interface DatabaseConsoleToolbarOwnerProps {
  /** 当前打开的连接 ID（无连接时为 undefined）。 */
  activeConnectionId?: string
}

export {}