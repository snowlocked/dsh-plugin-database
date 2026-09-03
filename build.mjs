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
  // react 内联进产物，不依赖 loader 的模块表（除 css 外无任何外部依赖）
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
