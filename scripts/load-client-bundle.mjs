// 在没有 DSH shell 的环境下，加载 dsh-database-console.client.js，
// 检查它不会立刻抛错、并触发独立预览分支（无 __ModuleLoader__）。
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const target = resolve(root, 'dist/dsh-database-console.client.js')

function makeElement(tag) {
  const el = {
    tagName: tag.toUpperCase(),
    children: [],
    style: {},
    classList: { add() {}, remove() {} },
    dataset: {},
    isConnected: false,
    parentElement: null,
    appendChild(c) { this.children.push(c); c.parentElement = this; c.isConnected = true; return c },
    remove() { this.isConnected = false },
    setAttribute(k, v) { this[k] = v },
    addEventListener() {},
    querySelector() { return null },
    getElementById() { return null },
    get firstElementChild() { return null },
  }
  return el
}

const captured = {}
const ctx = vm.createContext({
  console,
  setTimeout,
  clearTimeout,
  Promise,
  JSON,
  queueMicrotask: (fn) => Promise.resolve().then(fn),
  fetch: () => Promise.reject(new Error('no fetch in sandbox')),
  document: {
    readyState: 'complete',
    createElement: makeElement,
    head: { appendChild() {} },
    body: { appendChild() {}, addEventListener() {} },
    documentElement: { setAttribute() {}, removeAttribute() {}, style: {} },
    addEventListener() {},
    dispatchEvent() {},
  },
  window: {
    __ModuleLoader__: {
      load({ id, factory }) {
        const mod = factory({})
        captured.id = id
        captured.inject = mod.inject
        captured.apply = mod.apply
        captured.exports = mod
      },
    },
  },
})

const code = readFileSync(target, 'utf8')
try {
  vm.runInContext(code, ctx, { filename: 'dsh-database-console.client.js' })
} catch (err) {
  console.error('CLIENT BUNDLE THREW ON LOAD:', err)
  process.exit(1)
}

console.log('---client bundle load OK---')
console.log('id loaded:', captured.id)
console.log('exports.inject:', JSON.stringify(captured.inject))
console.log('apply is function:', typeof captured.apply === 'function')
console.log('window.__ModuleLoader__ present:', Boolean(ctx.window.__ModuleLoader__))

// 再触发一次 apply，模拟无 slots/locale 的回退路径（独立预览分支）。
try {
  captured.apply()
  console.log('standalone-preview apply() did not throw')
} catch (err) {
  console.error('standalone-preview apply() threw:', err)
  process.exit(1)
}