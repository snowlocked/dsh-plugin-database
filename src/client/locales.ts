/**
 * dsh-database-console 的 `database` 命名空间字典。
 * locale 注册交给 ctx.locale.register(NS, { zh, en })，key 必须中英等量；
 * 缺 key 在 typed 形式下编译失败，新增文本要同时落到两个字典。
 */
import type {} from './contract/slots.d.ts'

export const NS = 'database'

/** 简体中文。 */
export const zh = {
  'sidebar.label': '数据库',
  'sidebar.aria': '数据库工作台',
  'sidebar.title': '打开数据库工作台',
  'overlay.aria': '数据库工作台面板',
  'overlay.close': '回到对话',
  'toolbar.open': '打开数据库',
  'toolbar.close': '关闭数据库',
} as const

/** 英文（缺省回退）。 */
export const en = {
  'sidebar.label': 'Database',
  'sidebar.aria': 'Database console',
  'sidebar.title': 'Open database console',
  'overlay.aria': 'Database console panel',
  'overlay.close': 'Back to conversation',
  'toolbar.open': 'Open database',
  'toolbar.close': 'Close database',
} as const

/** 联合类型：locale.register 与 ctx.locale.bind 都靠它做编译期 key 检查。 */
export type DatabaseDictionary = typeof zh | typeof en
export type DatabaseTranslate = (key: keyof typeof zh) => string