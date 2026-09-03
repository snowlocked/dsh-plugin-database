/// <reference path="./client.d.ts" />
import cssText from './styles.css'

/** 面板 & 入口 & 中栏接管等全局规则的唯一注入点。 */
const STYLE_ID = 'dsh-database-console-style'

export function ensureThemeStyle(): () => void {
  if (typeof document === 'undefined') return () => {}
  const existing = document.getElementById(STYLE_ID)
  if (existing !== null && existing.isConnected) return () => { /* 已在文档中 */ }
  const tag = document.createElement('style')
  tag.id = STYLE_ID
  tag.setAttribute('data-plugin', 'dsh-database-console')
  tag.textContent = cssText
  document.head.appendChild(tag)
  return () => {
    if (tag.isConnected) tag.remove()
  }
}
