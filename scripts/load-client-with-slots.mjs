// 用 stub 模拟 DSH slots/locale 服务，加载 client bundle 后调用 apply(ctx)，
// 验证 slot 注册 / locale 注册都正确触发，组件被挂到三条 slot 上。
// esbuild iife 把 React/ReactDOM 留作 external，bundle 通过 `require(...)` 从
// DSH 加载器拿，**必须**给 factory 传一个真的 require 函数。
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const target = resolve(root, 'dist/dsh-database-console.client.js')

const captured = {}
const slotsLog = []
const localeLog = []

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

/**
 * Mock React：返回 minimal stubs，让组件渲染可以跑（不验证 React 行为本身，
 * 只验证 slot 注册链 + prop 流转）。这只是为了在 jsdom 沙箱里跑通 apply，
 * 真正的渲染验证在浏览器里做。
 */
function makeReactMock() {
  const identity = (x) => x
  const noop = () => {}
  const noopDispatch = (callback) => callback()
  const stub = (type) => {
    const Comp = (props) => ({ $$typeof: Symbol.for('react.element'), type, props: props || {} })
    Comp.displayName = type
    return Comp
  }
  const react = {
    useState: (init) => [typeof init === 'function' ? init() : init, noop],
    useEffect: noopDispatch,
    useMemo: (fn) => fn(),
    useCallback: (fn) => fn,
    useRef: (init) => ({ current: init }),
    useSyncExternalStore: () => ({ panelOpen: false, activeConnectionId: null }),
    createElement: stub('createElement'),
    Fragment: Symbol.for('react.fragment'),
    Children: { map: identity, forEach: identity, count: (a) => (a?.length ?? 0), toArray: identity },
  }
  const jsxRuntime = { jsx: stub('jsx'), jsxs: stub('jsxs'), jsxDEV: stub('jsxDEV') }
  const reactDom = {
    createRoot: () => ({
      render: noop,
      unmount: noop,
    }),
  }
  return { react, jsxRuntime, reactDom }
}

const mocks = makeReactMock()
const mockRequire = (spec) => {
  switch (spec) {
    case 'react': return mocks.react
    case 'react/jsx-runtime': return mocks.jsxRuntime
    case 'react-dom': return mocks.reactDom
    case 'react-dom/client': return mocks.reactDom
    default: throw new Error(`smoke test: unhandled require("${spec}")`)
  }
}

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
    getElementById: () => null,
    head: { appendChild() {} },
    body: { appendChild() {}, addEventListener() {} },
    documentElement: { setAttribute() {}, removeAttribute() {}, style: {} },
    addEventListener() {},
    dispatchEvent() {},
  },
  window: {
    __ModuleLoader__: {
      load({ id, factory }) {
        const mod = factory(mockRequire)
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

const registeredComponents = {}
const slotRegistry = {
  inject(key, callback) {
    slotsLog.push({ op: 'inject', key })
    callback() // 同步执行，让 register 立刻被调用
    return () => slotsLog.push({ op: 'dispose:inject', key })
  },
  register(options, component) {
    const id = options.id ?? options.key ?? '?'
    if (!registeredComponents[id]) registeredComponents[id] = []
    registeredComponents[id].push({ slot: options.name, options, component })
    return () => {}
  },
}
const localeFace = {
  register(namespace, dicts) {
    localeLog.push({ op: 'register', namespace, locales: Object.keys(dicts) })
    return () => {}
  },
  bind(namespace) {
    return (key) => `${namespace}:${String(key)}`
  },
}

const effectDisposers = []
const fakeCtx = {
  slots: slotRegistry,
  locale: localeFace,
  effect(fn, label) {
    let dispose
    try {
      const ret = fn()
      dispose = typeof ret === 'function' ? ret : () => {}
    } catch (e) {
      console.error(`effect(${label}) threw:`, e)
    }
    effectDisposers.push(() => dispose?.())
  },
}

try {
  captured.apply(fakeCtx)
} catch (err) {
  console.error('apply(ctx with slots/locale) threw:', err)
  process.exit(1)
}

console.log('---apply(ctx) OK---')
console.log('slots inject events:')
for (const item of slotsLog) console.log('  ', JSON.stringify(item))
console.log('locale events:')
for (const item of localeLog) console.log('  ', JSON.stringify(item))
console.log('registered component ids per slot:')
for (const [id, items] of Object.entries(registeredComponents)) {
  for (const item of items) console.log(`  id=${id}  slot=${item.slot}  order=${item.options.order}  label=${typeof item.options.label === 'function' ? '<fn>' : item.options.label}`)
}

// 触发现有所有注册的 effect disposer，确认清理路径不抛
for (const d of effectDisposers) {
  try { d() } catch (e) { console.error('dispose threw:', e) }
}
console.log('effect teardown OK')