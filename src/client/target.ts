/** 客户端侧共享的类型与常量（无 UI 依赖）。 */

import type { TableEntry } from './client.ts'

/**
 * “打开一个数据浏览 Tab”的目标对象快照：
 * 在左侧连接树里选定 数据库/schema/表 后一次成型，Tab 生命周期内固定。
 * database 为空字符串时应视为“连接保存的默认库”，调 API 时不传。
 */
export interface BrowseTarget {
  table: TableEntry
  database?: string
  schema?: string
}
