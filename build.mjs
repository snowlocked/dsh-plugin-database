// DSH 插件构建：服务端 + 客户端单文件产物（跨平台，无需 shell 脚本）
import { build, context } from 'esbuild'
import { mkdirSync, copyFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
mkdirSync(join(root, 'dist'), { recursive: true })

const serverOptions = {
  entryPoints: [join(root, 'src/index.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  external: ['dmdb', 'pg', 'mysql2', 'mongodb', '@deepseek-ai/dsh-tools'],
  outfile: join(root, 'dist/dsh-database-console.js'),
  logLevel: 'info',
  minify: true,
  sourcemap: false,
}

const clientOptions = {
  entryPoints: [join(root, 'src/client/index.tsx')],
  bundle: true,
  platform: 'browser',
  format: 'iife',
  target: 'chrome100',
  loader: { '.css': 'text' },
  // ⚠️ 必须把 React/ReactDOM 留作 external —— esbuild 默认会把 react 内联进产物，
  // 那会引入 **第二份** React 实例，hooks 调用时 dispatch 指向我们内联的 React，
  // 而 DSH 主机用的是它自己的 React，结果 `de.current` 是 null，所有 hook 都抛
  // "Cannot read properties of null (reading 'useSyncExternalStore')"。
  // 走 loader 的 require 之后，react = require('react') 返回的是 DSH staticModules
  // 里那份 React，dispatcher 与主机 React 一致。
  // DSH staticModules 表暴露的就是这些平台种子词。
  external: ['react', 'react/jsx-runtime', 'react-dom', 'react-dom/client'],
  // 用 banner/footer 把 iife 输出套进 DSH 的 factory 闭包：factory(require) 接收
  // loader 给的 require，把 react/react-dom 等外部包都通过它解析到 host React。
  // iife 的 globalName 让产物把 module.exports 挂到 __dsh_db_console_module__。
  globalName: '__dsh_db_console_module__',
  banner: {
    js: [
      'window.__ModuleLoader__.load({',
      '  id: "@snowlocked/dsh-database-console",',
      '  factory: (require) => {',
      '    "use strict";',
      '    var __dsh_db_module = { exports: {} };',
      '    var __dsh_db_exports = __dsh_db_module.exports;',
      '    Object.defineProperty(__dsh_db_exports, Symbol.toStringTag, { value: "Module" });',
    ].join('\n'),
  },
  footer: {
    js: [
      '    return __dsh_db_console_module__;',
      '  },',
      '});',
    ].join('\n'),
  },
  outfile: join(root, 'dist/dsh-database-console.client.js'),
  logLevel: 'info',
  minify: true,
  sourcemap: false,
}

const watch = process.argv.includes('--watch')

if (watch) {
  const server = await context(serverOptions)
  const client = await context(clientOptions)
  await Promise.all([server.watch(), client.watch()])
  console.log('watching… 产物在 dist/ 下')
} else {
  await build(serverOptions)
  await build(clientOptions)
  // 同步到 plugins/dsh-database-console（供拷贝到 DSH 插件目录）
  const pluginDir = join(root, 'plugins/dsh-database-console/lib')
  mkdirSync(pluginDir, { recursive: true })
  // 插件包内的命名与 dsh 客户端约定一致：lib/index.js（服务端）+ lib/client.js（浏览器端）
  const pairs = [
    ['dsh-database-console.js', 'index.js'],
    ['dsh-database-console.client.js', 'client.js'],
  ]
  for (const [sourceName, targetName] of pairs) {
    const source = join(root, 'dist', sourceName)
    const target = join(pluginDir, targetName)
    if (existsSync(source)) copyFileSync(source, target)
  }
  console.log('build ok → dist/ 与 plugins/dsh-database-console/lib/')
}
