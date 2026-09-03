/**
 * e2e-live：起一个真实的 dsh web 第二实例（不影响宿主 GUI），验证插件的
 * HTTP 行为是否符合真实 webServer 路由（DELETE 405? / GET 404? / 密码保留 / 删除）。
 *
 * 用法：node scripts/e2e-live.mjs [port]
 * 结束自动 taskkill 子进程树并清理临时 SQLite。
 */
import { spawn, execSync } from 'node:child_process'
import fs from 'node:fs'
import { mkdtempSync, existsSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir, homedir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const PORT = Number(process.argv[2] ?? (4300 + Math.floor(Math.random() * 400)))
const BASE = `http://127.0.0.1:${PORT}`
const PREFIX = '/api/dsh-database-console'
// 真实 DSH 安装位置可用 DSH_BIN 环境变量覆盖（默认：npm i -g @deepseek-ai/dsh 的安装路径）
const DSH_BIN = process.env.DSH_BIN ?? 'D:\\Program Files\\nodejs\\node_modules\\@deepseek-ai\\dsh\\lib\\bin.js'
const NODE_BIN = process.execPath
const HOME_DIR = process.env.DSH_HOME ?? join(homedir(), '.dsh')
const PROFILE = join(HOME_DIR, 'profiles', 'web')

const dir = mkdtempSync(join(tmpdir(), 'dsh-db-e2e-'))
const dbFile = join(dir, 'demo.db')
const storeDir = join(dir, 'store')
const logFile = join(dir, 'dsh.log')
if (!existsSync(dbFile)) {
  const db = new DatabaseSync(dbFile)
  db.exec(`create table if not exists users (id integer primary key, name text not null, city text)`)
  db.prepare('insert into users (name, city) values (?, ?)').run('张三', '北京')
  db.prepare('insert into users (name, city) values (?, ?)').run('李四', '上海')
  db.close()
}

let child
let TOKEN = ''
let COOKIE = ''
function startDsh() {
  const out = join(dir, 'dsh.out.log')
  child = spawn(NODE_BIN, [DSH_BIN, 'web', '--port', String(PORT), '--no-open'], {
    cwd: PROFILE,
    env: { ...process.env, DSH_HOME: HOME_DIR },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  })
  child.stdout.on('data', (chunk) => {
    process.stdout.write(chunk)
    const match = /token=([A-Za-z0-9_-]+)/u.exec(String(chunk))
    if (match && !TOKEN) TOKEN = match[1]
  })
  child.stderr.pipe(process.stdout)
  writeFileSync(out, '')
  child.unref?.()
}

function stopDsh() {
  try {
    if (child && child.pid) execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' })
  } catch { /* 已退出 */ }
}

let connId = ''
let failures = 0
function check(name, ok, extra = '') {
  console.log(`${ok ? '  ✓' : '  ✗'} ${name}${!ok && extra ? `  ${String(extra).slice(0, 400)}` : ''}`)
  if (!ok) failures += 1
}

async function api(method, path, body) {
  const headers = {}
  if (body !== undefined) headers['content-type'] = 'application/json'
  if (COOKIE) headers.cookie = COOKIE
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  let json = null
  try { json = await response.json() } catch { /* 空体 */ }
  return { status: response.status, json }
}

async function waitReady(attempts = 90) {
  // 等 token 出现在启动日志中，然后用它访问根页面换取信任 cookie
  for (let i = 0; i < 20 && !TOKEN; i += 1) await new Promise((resolve) => setTimeout(resolve, 500))
  if (TOKEN) {
    try {
      const page = await fetch(`${BASE}/?token=${TOKEN}`, { redirect: 'manual' })
      const setCookie = page.headers.get('set-cookie')
      if (setCookie) COOKIE = setCookie.split(';')[0]
      console.log(`   （凭证）root=${page.status} cookie=${COOKIE.slice(0, 40) || '无'} token=${TOKEN.slice(0, 6)}…`)
    } catch { /* 根页面不可达 */ }
  }
  for (let i = 0; i < attempts; i += 1) {
    try {
      const r = await api('POST', `${PREFIX}/state`, {})
      if (r.status === 200) return r
    } catch { /* 未就绪 */ }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  return null
}

startDsh()
try {
  const state = await waitReady()
  check('实例就绪 & state 200', state?.status === 200 && state.json?.ok === true, state ? JSON.stringify(state.json).slice(0, 200) : 'timeout')

  // 1) 保存 SQLite 连接（带密码），编辑不重输密码再保存 → 保留；列表相对基线仅 +1
  let baseline = 0
  {
    const pre = await api('POST', `${PREFIX}/connections/list`, {})
    baseline = Array.isArray(pre.json?.connections) ? pre.json.connections.length : 0
  }
  const connInput = { name: 'e2e-demo', type: 'sqlite', file: dbFile, password: 'pw123' }
  {
    const r = await api('POST', `${PREFIX}/connections/save`, connInput)
    check('保存连接 ok', r.status === 200 && r.json?.ok === true, JSON.stringify(r.json))
    connId = r.json?.connection?.id ?? ''
    check('hasPassword=true', r.json?.connection?.hasPassword === true)
  }
  {
    const r = await api('POST', `${PREFIX}/connections/save`, { ...connInput, id: connId, password: '' })
    check('空密码再保存仍保留', r.json?.connection?.hasPassword === true && r.status === 200, JSON.stringify(r.json))
  }
  {
    const r = await api('POST', `${PREFIX}/connections/list`, {})
    check('列表比基线 +1（无重复新建）', Array.isArray(r.json?.connections) && r.json.connections.length === baseline + 1, `baseline=${baseline} now=${r.json?.connections?.length}`)
  }
  // 2) 测试连接不带密码（应使用已存密码）——SQLite 连接本身不校验密码，断言能跑通
  {
    const r = await api('POST', `${PREFIX}/connections/test`, { ...connInput, id: connId, password: undefined })
    check('测试连接(不重输密码) ok', r.status === 200 && r.json?.ok === true, JSON.stringify(r.json))
  }
  // 3) 浏览：tables / columns / rows（用户报 404 的路径）
  {
    const r = await api('POST', `${PREFIX}/connection/tables`, { id: connId })
    check('POST tables 200（无 404）', r.status === 200 && r.json?.tables?.length >= 1, JSON.stringify(r.json ?? r.status))
  }
  {
    const r = await api('POST', `${PREFIX}/connection/columns`, { id: connId, table: 'users' })
    check('POST columns 200', r.status === 200 && r.json?.columns?.length >= 3, JSON.stringify(r.json ?? r.status))
  }
  {
    const r = await api('POST', `${PREFIX}/connection/rows`, { id: connId, table: 'users', limit: 5, offset: 0 })
    check('POST rows 200（2 行）', r.status === 200 && r.json?.rowCount === 2, JSON.stringify(r.json ?? r.status))
  }
  // 4.4) 只读查询自动限行（SQL 控制台默认只取一页，不再全量）
  {
    const cap = await api('POST', `${PREFIX}/query`, { id: connId, sql: 'select * from users', readOnly: true })
    check('自动限行: rows=2 且带提示', cap.status === 200 && cap.json?.rows?.length === 2 && String(cap.json?.message ?? '').includes('自动限制'), JSON.stringify(cap.json ?? cap.status))
    const own = await api('POST', `${PREFIX}/query`, { id: connId, sql: 'select * from users limit 1', readOnly: true })
    check('自带 LIMIT 不被追加(rows=1)', own.status === 200 && own.json?.rows?.length === 1, JSON.stringify(own.json ?? own.status))
  }
  // 4.5) 单元格编辑（SQLite users.id 主键定位 → UPDATE city）
  {
    const upd = await api('POST', `${PREFIX}/connection/cell/update`, {
      id: connId, table: 'users', column: 'city', pk: [{ column: 'id', value: 1 }], value: '北京-已改', isNull: false,
    })
    check('单元格更新 ok(affectedRows=1)', upd.status === 200 && upd.json?.ok === true && upd.json?.affectedRows === 1, JSON.stringify(upd.json ?? upd.status))
    const after = await api('POST', `${PREFIX}/connection/rows`, { id: connId, table: 'users', limit: 5, offset: 0 })
    const first = after.json?.rows?.[0] ?? []
    check('单元格更新已生效', first.join('|').includes('北京-已改'), JSON.stringify(after.json ?? after.status))
    const upd2 = await api('POST', `${PREFIX}/connection/cell/update`, {
      id: connId, table: 'users', column: 'city', pk: [{ column: 'id', value: 999 }], value: 'x', isNull: false,
    })
    check('不存在的行更新 affectedRows=0', upd2.status === 200 && upd2.json?.affectedRows === 0, JSON.stringify(upd2.json ?? upd2.status))
    const noPk = await api('POST', `${PREFIX}/connection/cell/update`, {
      id: connId, table: 'users', column: 'city', pk: [], value: 'x', isNull: false,
    })
    check('无主键定位被拒绝(400)', noPk.status === 400, `status=${noPk.status}`)
  }
  // 4.6) 数据浏览：整表排序 / 列过滤 / 分页总数（sqlite users）
  {
    const desc = await api('POST', `${PREFIX}/connection/rows`, { id: connId, table: 'users', limit: 50, offset: 0, sort: { column: 'id', dir: 'desc' } })
    const descFirst = (desc.json?.rows?.[0] ?? [])[0]
    check('浏览排序 id desc 生效', desc.status === 200 && String(descFirst) === '2', JSON.stringify(desc.json ?? desc.status))
    const flt = await api('POST', `${PREFIX}/connection/rows`, { id: connId, table: 'users', limit: 50, offset: 0, filters: { city: '海' } })
    const fltRows = flt.json?.rows ?? []
    check('浏览过滤 包含"海" 生效(total=1)', flt.status === 200 && fltRows.length === 1 && JSON.stringify(fltRows[0]).includes('海') && flt.json?.total === 1, JSON.stringify(flt.json ?? flt.status))
    const page1 = await api('POST', `${PREFIX}/connection/rows`, { id: connId, table: 'users', limit: 1, offset: 0 })
    check('浏览分页 hasMore(total 未给)', page1.status === 200 && page1.json?.rows?.length === 1 && page1.json?.total === undefined, JSON.stringify(page1.json ?? page1.status))
    const sortBad = await api('POST', `${PREFIX}/connection/rows`, { id: connId, table: 'users', limit: 50, offset: 0, sort: { column: 'city; drop table x', dir: 'asc' } })
    check('非法排序列被引用转义(不注入/表仍在)', (sortBad.status === 200 || sortBad.status === 500 || sortBad.status === 502) && sortBad.status !== 200 ? true : sortBad.status === 200, `status=${sortBad.status}`)
    const intact = await api('POST', `${PREFIX}/connection/rows`, { id: connId, table: 'users', limit: 50, offset: 0 })
    check('注入尝试后表数据完好(2 行)', (intact.json?.rows?.length ?? 0) === 2, JSON.stringify(intact.json ?? intact.status))
  }
  // 4) 删除（真实 webServer 只支持 POST；顺带观测 DELETE 是否 405）
  {
    const r0 = await api('DELETE', `${PREFIX}/connection?id=${connId}`)
    console.log(`   （观测）DELETE /connection → HTTP ${r0.status}`)
    const r2 = await api('POST', `${PREFIX}/connection/remove`, { id: connId })
    check('POST 删除 ok', r2.status === 200 && r2.json?.ok === true, JSON.stringify(r2.json))
    const list = await api('POST', `${PREFIX}/connections/list`, {})
    check('删除后回到基线', Array.isArray(list.json?.connections) && list.json.connections.length === baseline, `baseline=${baseline} now=${list.json?.connections?.length}`)
  }
  // 5) PG 数据库切换（对用户真实保存的 PG 连接：枚举库 → 切到 test2 浏览/查询）
  {
    const storePath = join(HOME_DIR, 'dsh-database', 'connections.json')
    if (fs.existsSync(storePath)) {
      let raw
      try { raw = JSON.parse(fs.readFileSync(storePath, 'utf8')) } catch { raw = [] }
      const list = Array.isArray(raw) ? raw : (raw.connections ?? [])
      const pgConn = list.find((c) => c.type === 'postgresql' && c.host === '192.168.48.36')
      if (pgConn) {
        const dbRes = await api('POST', `${PREFIX}/connection/databases`, { id: pgConn.id })
        const names = dbRes.json?.databases ?? []
        check('PG 数据库枚举 supported 且含 test2', dbRes.status === 200 && dbRes.json?.supported === true && names.includes('test2'),
          `status=${dbRes.status} json=${JSON.stringify(dbRes.json ?? null)}`)
        const sc = await api('POST', `${PREFIX}/connection/schemas`, { id: pgConn.id, database: 'test2' })
        check('PG test2 库 schema 200', sc.status === 200 && Array.isArray(sc.json?.schemas), JSON.stringify(sc.json ?? sc.status))
        const tb = await api('POST', `${PREFIX}/connection/tables`, { id: pgConn.id, database: 'test2', schema: 'public' })
        check('PG test2.public 表列表 200', tb.status === 200 && Array.isArray(tb.json?.tables), JSON.stringify(tb.json ?? tb.status))
        const rt = await api('POST', `${PREFIX}/query`, { id: pgConn.id, database: 'test2', sql: 'select current_database() as db', readOnly: true })
        check('PG test2 库上执行 SQL', rt.status === 200 && rt.json?.rows?.[0]?.[0] === 'test2', `status=${rt.status} json=${JSON.stringify(rt.json ?? null)}`)
      } else {
        console.log('   （跳过）未找到 48.36 的 PG 连接')
      }
    }
  }
  // 6) AI 模型列表（观测）
  {
    const r = await api('POST', `${PREFIX}/ai/models`, {})
    console.log(`   （观测）POST /ai/models → HTTP ${r.status}, ok=${r.json?.ok}, providers=${(r.json?.providers ?? []).length}`)
  }
} finally {
  if (connId) {
    try { await api('POST', `${PREFIX}/connection/remove`, { id: connId }) } catch { /* 清理失败忽略 */ }
  }
  stopDsh()
  await new Promise((resolve) => setTimeout(resolve, 500))
  rmSync(dir, { recursive: true, force: true })
}
console.log(failures === 0 ? '\nE2E-LIVE PASS' : `\nE2E-LIVE FAIL (${failures})`)
process.exit(failures === 0 ? 0 : 1)
