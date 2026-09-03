// 服务端冒烟：不依赖 cordis，直接模拟 ctx 调用插件 apply，再用内存 fake 路由 handler 驱动 HTTP 层。
import { apply } from '../dist/dsh-database-console.js'
import { DatabaseSync } from 'node:sqlite'
import { mkdtempSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const dir = mkdtempSync(join(tmpdir(), 'dsh-db-smoke-'))
const dataDir = join(dir, 'dsh-data')

// 准备一个真实 SQLite 文件
const dbFile = join(dir, 'demo.db')
{
  const db = new DatabaseSync(dbFile)
  db.exec(`create table if not exists users (
    id integer primary key autoincrement,
    name text not null,
    city text,
    age integer
  )`)
  db.prepare('insert into users (name, city, age) values (?,?,?)').run('张三', '北京', 30)
  db.prepare('insert into users (name, city, age) values (?,?,?)').run('李四', '上海', null)
  db.close()
}

const effects = []
const routes = []
const disposers = []
const logs = []
const seenInject = new Set()
const ctx = {
  logger: { info: (m) => logs.push(['info', m]), warn: (m) => logs.push(['warn', m]), error: (m) => logs.push(['error', m]) },
  get(name) { return undefined },
  inject(names, cb) {
    const sctx = {
      effect(fn) { effects.push(fn) },
      webServer: { register(route) { routes.push(route); const d = () => { /* noop */ }; disposers.push(d); return d } },
      tools: { register() { return () => {} } },
      systemPrompt: { section() { return () => {} } },
    }
    for (const name of names) seenInject.add(name)
    cb(sctx)
  },
}

apply(ctx, { dataDir, maxRows: 100 })

// 运行所有 effect，拿到注册的路由
for (const effect of effects) {
  const cleanup = effect()
  if (typeof cleanup === 'function') cleanup()
}
console.log('inject 服务:', [...seenInject].join(','))
console.log('注册路由数:', routes.length)

function callSync(method, url, body) {
  // 简易同步封装：由于 handler 异步但我们的 response.end 同步记录，直接 await 一次微任务再读
  return new Promise((resolve, reject) => {
    const route = routes.find((r) => r.kind === 'exact' && r.path === url.split('?')[0] && (!r.method || r.method === method))
    if (!route) return reject(new Error(`no route ${url}`))
    const request = {
      method,
      url,
      async *[Symbol.asyncIterator]() {
        if (body !== undefined) yield Buffer.from(JSON.stringify(body))
      },
    }
    const response = {
      statusCode: 0,
      setHeader() {},
      end(text) { response._text = String(text ?? '') },
    }
    route.handler(request, response)
      .then(() => resolve({ status: response.statusCode, json: JSON.parse(response._text || 'null') }))
      .catch(reject)
  })
}

let failures = 0
function check(name, cond, extra = '') {
  if (cond) console.log(`  ✓ ${name}`)
  else { failures++; console.error(`  ✗ ${name} ${extra}`) }
}

// 1) state
{
  const r = await callSync('POST', '/api/dsh-database-console/state', {})
  check('state ok', r.status === 200 && r.json.ok === true, JSON.stringify(r))
  check('state storeFile 存在', typeof r.json.storeFile === 'string')
}

// 2) 保存 SQLite 连接
const connInput = {
  name: 'demo-sqlite', type: 'sqlite', file: dbFile, host: '',
}
let connId = ''
{
  const r = await callSync('POST', '/api/dsh-database-console/connections/save', connInput)
  check('save ok', r.status === 200 && r.json.ok === true, JSON.stringify(r))
  connId = r.json.connection.id
  check('save 返回脱敏视图', r.json.connection.hasPassword === false && r.json.connection.password === undefined)
}
{
  const r = await callSync('POST', '/api/dsh-database-console/connections/save', { ...connInput, id: connId })
  check('重复保存(更新) ok', r.status === 200 && r.json.connection.id === connId)
}
{
  const r = await callSync('POST', '/api/dsh-database-console/connections/list', {})
  check('列表含 1 条', r.json.connections.length === 1)
}
// 2.1) 同名新建保护（误把“编辑”当“新建”时不再静默产生第二条）
{
  const r = await callSync('POST', '/api/dsh-database-console/connections/save', { ...connInput, name: 'demo-sqlite' })
  check('重复目标新建被拒绝', r.status === 400 && /同一目标/.test(r.json.error), JSON.stringify(r))
}
// 2.2) 编辑保存不重新填密码时保留原密码（不因 undefined 覆盖而清空）
{
  const r1 = await callSync('POST', '/api/dsh-database-console/connections/save', { ...connInput, id: connId, password: 's3cret' })
  check('带密码保存 ok', r1.json.connection.hasPassword === true)
  const r2 = await callSync('POST', '/api/dsh-database-console/connections/save', { ...connInput, id: connId, file: dbFile })
  check('二次保存(不带密码)仍保留', r2.json.connection.hasPassword === true, JSON.stringify(r2))
  const list = await callSync('POST', '/api/dsh-database-console/connections/list', {})
  check('列表仍 1 条(无新增)', list.json.connections.length === 1)
}
// 3) 表列表 + 列 + 预览
{
  const r = await callSync('POST', '/api/dsh-database-console/connection/tables', { id: connId })
  check('tables 含 users', r.json.tables.some((t) => t.name === 'users' && t.kind === 'table'))
}
{
  const r = await callSync('POST', '/api/dsh-database-console/connection/columns', { id: connId, table: 'users' })
  check('columns 4 个字段', r.json.columns.length === 4 && r.json.columns[0].primary === true)
}
{
  const r = await callSync('POST', '/api/dsh-database-console/connection/rows', { id: connId, table: 'users', limit: 10, offset: 0 })
  check('预览 2 行含列名', r.json.rowCount === 2 && r.json.columns.includes('city'), JSON.stringify(r))
}
// 4) SQL 执行
{
  const r = await callSync('POST', '/api/dsh-database-console/query', { id: connId, sql: 'select id,name,city from users where city=? order by id', params: ['北京'], readOnly: true })
  check('参数化查询 ok', r.json.rowCount === 1 && r.json.rows[0][1] === '张三', JSON.stringify(r))
}
{
  const r = await callSync('POST', '/api/dsh-database-console/query', { id: connId, sql: 'delete from users where id=1', readOnly: true })
  check('只读拦截 delete', r.status === 400 && /只读/.test(r.json.error))
}
{
  const r = await callSync('POST', '/api/dsh-database-console/query', { id: connId, sql: 'update users set age=31 where id=2', readOnly: false })
  check('写语句受影响行数', r.json.affectedRows === 1 && r.json.kind === 'change', JSON.stringify(r))
}
// 5) 测试连接（真实 sqlite 文件）
{
  const r = await callSync('POST', '/api/dsh-database-console/connections/test', connInput)
  check('test ok', r.json.ok === true, JSON.stringify(r))
}
{
  const r = await callSync('POST', '/api/dsh-database-console/connections/test', { ...connInput, file: join(dir, 'not-exists.db') })
  check('test 失败路径', r.json.ok === false && /不存在/.test(r.json.message))
}
// 6) AI：无可用模型时应优雅报 502 且不执行
{
  const r = await callSync('POST', '/api/dsh-database-console/ai/generate', { id: connId, question: '有多少人' })
  check('AI 无路由报错(500/502)', [500, 502, 503].includes(r.status) || (r.json && r.json.error && r.json.error.length > 0), `${r.status} ${JSON.stringify(r.json)}`)
}
// 6.5) 服务器级数据库列表（sqlite 不支持 → supported:false）
{
  const r = await callSync('POST', '/api/dsh-database-console/connection/databases', { id: connId })
  check('databases supported=false(sqlite)', r.status === 200 && r.json.supported === false && r.json.databases.length === 0, JSON.stringify(r.json))
}

// 7) 删除（POST /connection/remove 为主通道；DELETE /connection 兼容通道）
{
  const r = await callSync('POST', '/api/dsh-database-console/connection/remove', { id: connId })
  check('POST 删除 ok', r.json.ok === true, JSON.stringify(r))
  const r2 = await callSync('POST', '/api/dsh-database-console/connections/list', {})
  check('删除后列表空', r2.json.connections.length === 0)
}
{
  const again = await callSync('POST', '/api/dsh-database-console/connections/save', connInput)
  const id2 = again.json.connection.id
  const rd = await callSync('POST', '/api/dsh-database-console/connection/remove', { id: id2 })
  check('再次删除 ok', rd.json.ok === true, JSON.stringify(rd))
  const r2 = await callSync('POST', '/api/dsh-database-console/connections/list', {})
  check('再次删除后列表空', r2.json.connections.length === 0)
}

console.log(failures === 0 ? '\nSMOKE PASS' : `\nSMOKE FAIL (${failures})`)
console.log('连接文件位置:', join(dataDir, 'connections.json'), '存在=', existsSync(join(dataDir, 'connections.json')))
rmSync(dir, { recursive: true, force: true })
process.exit(failures === 0 ? 0 : 1)
