# dsh-database-console

DSH（DeepSeek Harness）**数据库工作台**插件：把数据库搬进对话与 Web 界面。

- 支持 5 种数据库：**PostgreSQL、MySQL、MongoDB、SQLite（Node 内置驱动，零原生依赖）、达梦 DM（官方 dmdb 驱动）**
- 连接管理（保存/测试/删除，密码支持 `env:VAR` 或 `cred:NAME` 引用，存储文件 `chmod 600`）
- 工作台 UI（IDE 式）：左侧“连接管理 + 连接对象树”，右侧多 Tab ——
  每张表/视图/集合一个工作区 Tab（点表即开、重复点自动定位旧 Tab、可关闭、过多时横向滚动）；
  每个 Tab 内含「数据浏览 / SQL 查询 / 自然语言查询」三个子页，子页各自保持状态，
  面板收起再打开同样保留上次内容
- 自适应页面宽度：面板实时贴合 DSH 中栏（左侧栏折叠/窄屏 rail/拖宽、右侧详情栏开合自动跟随，
  面板内部用 container query 随宽度收窄导航与内边距）；点击面板外（左侧菜单的其它插件按钮、
  右侧详情栏等）自动收起工作台
- SQL 控制台：多语句、参数绑定、只读模式（默认开启，写操作需显式取消）
- AI 自然语言查数：自动采集表结构 → 生成只读 SQL →（可选）直接执行返回结果；AI 模型**复用 DSH 自身配置**，界面“按需选模型”，不在插件里重复填 Key
- 对话中给 AI 注册的 DB 工具：`db_connections` / `db_databases` / `db_tables` / `db_table_schema` / `db_query`（全部只读）
- 会话里“说人话”查库：系统提示注入**连接目录与口语别名**（如“36 数据库”→ 主机 192.168.48.36），
  连接参数支持按 id/名称/主机末段匹配；`database` 参数支持在同一台服务器的多个库间切换

## 目录结构

```
src/
  index.ts            插件入口（cordis apply + webServer / tools / systemPrompt 注入）
  http.ts             HTTP API（前缀 /api/dsh-database-console/*）
  manager.ts          方言注册、打开会话、连通测试、AI 结构采集
  store.ts            连接持久化（connections.json，脱敏输出）
  ai.ts               NL→SQL（复用 DSH 模型，按需选模型）
  tools.ts            对话 AI 的只读 DB 工具
  lookup.ts           连接“口语别名/主机段”解析（纯函数，供工具与单测复用）
  dialects/           postgres / mysql / sqlite / mongodb / dameng
  client/             React 单页界面（自行注入样式，无第三方 UI 依赖）
scripts/smoke.mjs     端到端冒烟（真实 SQLite 文件 + fake ctx 驱动全部路由；末尾含连接别名解析用例）
plugins/dsh-database-console/  可拷贝安装的插件包（含 lib 产物与 cordis.patch.yml）
```

## 构建与测试

```bash
npm install          # 含 dmdb / mongodb / mysql2 / pg（客户端 react 在 devDependencies）
npm run build        # 产出 dist/ 与 plugins/dsh-database-console/lib（两处均可作为安装源）
npm test             # = build + smoke（HTTP 冒烟 + “36 数据库→192.168.48.36”等别名解析用例）
node scripts/smoke.mjs   # 端到端冒烟（保存/测试/表浏览/参数查询/只读拦截/写语句/删除/AI 失败兜底）
npm run watch        # 开发热重建
```

## 安装到 DSH

DSH 是基于 Cordis 的插件系统：**profile** 是运行单元（如 `web`），插件通过 `dsh plugin`（转发给 profile 内的 pnpm）安装。以下均为已实测可用的安装路径。

### 0. 准备 DSH CLI（如未安装）

```bash
npm install -g @deepseek-ai/dsh     # 或：pnpm add -g @deepseek-ai/dsh
dsh --version
```

### 1. 方式 A：本地源码 + link（开发 / 自用，改动后 build 即生效）

```bash
git clone https://github.com/snowlocked/dsh-plugin-database.git
cd dsh-plugin-database
npm install
npm run build                       # 产出 dist/ 与 plugins/dsh-database-console/lib

# 把插件装进 web profile（link: 协议 = node_modules 软链到源码目录）
dsh plugin --profile web add "link:$(pwd)/plugins/dsh-database-console"
```

Windows PowerShell 下把 `$(pwd)` 换成仓库绝对路径：

```powershell
dsh plugin --profile web add "link:D:\path\to\dsh-plugin-database\plugins\dsh-database-console"
```

安装后重启 `dsh web`（Ctrl+F5 刷界面）。之后源码改动执行 `npm run build` 并重启 DSH 即更新。

### 2. 方式 B：npm registry（需先发布，见下方「发布到 npm」）

```bash
dsh plugin --profile web add @snowlocked/dsh-database-console
```

#### 发布到 npm（发布一次，之后所有人可直接 add）

插件以 `plugins/dsh-database-console/` 为发布源（与 `link:` 安装是同一形态：顶层 `lib/index.js` + `cordis.patch.yml` + package.json 的 `dsh.bundle.patch` 元数据）。仓库根的 `package.json` 已标记 `private: true` 防止误发布同名包。

```bash
# 0) 前置：注册 npm 账号（https://www.npmjs.com/signup）；若本地 registry 是镜像需先切官方
npm config set registry https://registry.npmjs.org

# 1) 登录（一次性，交互输入账号/密码/OTP）
npm login

# 2) 进入插件包目录发布（prepack 自动运行 node ../../build.mjs 重建 lib）
cd plugins/dsh-database-console
npm publish            # 发布 @snowlocked/dsh-database-console@0.1.0

# 3) 验证
npm view @snowlocked/dsh-database-console
npm pack --dry-run     # 发布前本地检查包内容（应为 lib/ + cordis.patch.yml + README + package.json）

# 4) 迭代发布：改版本后重复第 2 步
npm version patch      # 0.1.0 → 0.1.1（在 plugins/dsh-database-console 内执行）
```

发布后（npmmirror 等镜像同步约几分钟）即可让任何机器执行 `dsh plugin --profile web add dsh-database-console`，pnpm 会自动安装 dmdb/pg/mysql2/mongodb 等依赖。

### 3. 方式 C：没有 dsh CLI 时手工等价操作

```bash
# 编辑 ~/.dsh/profiles/web/package.json：
#   dependencies 增加  "@snowlocked/dsh-database-console": "link:D:/绝对路径/plugins/dsh-database-console"
#   dsh.profile.bundles 数组末尾追加 "@snowlocked/dsh-database-console"
cd ~/.dsh/profiles/web && pnpm install
```

重启后：左侧边栏出现「数据库」入口，Settings → Plugins 中可见并可启用/停用。入口 `lib/index.js`、客户端 `lib/client.js`、加载补丁 `cordis.patch.yml`（详见 `docs/INSTALL-WEB-PROFILE.md`）。

启用后：

- HTTP API：DSH 真实 webServer **仅支持 POST**（GET→404 / DELETE→405，已实测），因此全部接口为 `POST + JSON body`：
  `/state`、`/connections/list`、`/connections/save|test`、`/connection`（详情）、`/connection/remove`、
  `/connection/databases|schemas|tables|columns|rows`、`/connection/cell/update`、`/query`、`/ai/models`、`/ai/generate`、`/ai/run`
- Web GUI：左侧「数据库」入口 → 中栏工作台。左栏 = 连接管理（新建/编辑/删除/刷新）＋ 连接对象树
  （展开连接可选 数据库(PG/MySQL)/schema(PG/达梦)，点表/视图/集合在右侧打开该表的**工作区 Tab**，
  一个 Tab 内再分三个子页：📚数据浏览 / ⌨️SQL 查询 / 💬自然语言查询，各自独立保持状态）；
  数据浏览子页：字段结构展开、分页预览、整表排序/过滤、列宽拖拽、单元格点击编辑
  （按主键 UPDATE，无主键表禁用，MongoDB 只读提示）；
  SQL/自然语言子页默认跟随该表所在库（PG/MySQL 可在子页内切换目标库）。
  Tab 可关闭、过多时横向滚动、重复点同一对象自动定位旧 Tab；面板几何自动跟随 DSH 左右侧栏
  （含右侧详情栏开合/拖宽），收起再打开、切换 Tab 均保持各工作区状态；
  刷新页面后恢复上次是否打开面板与上次使用的连接。
  无 DSH 环境打开 client bundle 则退化为右下角悬浮独立预览
- 对话：AI 可直接调用 5 个只读 DB 工具；插件同时写入**动态连接目录**（含口语别名）系统提示指导用法

## AI 路由（NL→SQL）

- **模型配置不重复**：NL→SQL 直接复用 DSH 自身配置的模型（`ctx.llm` 的 provider / 模型 / 密钥），
  连接保存表单不含 AI 设置项；插件页提供 **“按需选模型”下拉**（数据来自 `GET /ai/models`），不选则 DSH 自动决定。
- 优先级：界面选择（provider/model）> 插件全局配置 `ai`（仅 cordis config 可设）> DSH 自动发现。
- 生成的 SQL 一律只读校验（仅允许 SELECT/WITH/SHOW/EXPLAIN 等），误生成 DML 会被拦截
- 表结构摘要默认最多采集 120 张表 × 40 列，避免上下文溢出

## 会话里直接说人话查库（别名解析 / 库切换）

普通对话中不必先背连接 id——把“xxx 数据库里的表”翻译成工具参数即可，例如用户说：

> 查一下 36 数据库 test2 里的 Item 表

含义是：**主机 192.168.48.36**（连接名「48.36」，默认库 `test2`）→ `public."Item"`。

- **connection 参数 = id / 名称 / 口语别名**：别名来自连接名与主机的段、点分后缀。
  “36”、“48.36”、“192.168.48.36” 都能命中同一连接；匹配按确定性规则打分，
  多条同分时**报歧义并列出候选**，不猜错库（见 `src/lookup.ts` 的单测）。
- **db_connections**：返回当前连接目录，每条附主机、默认库/模式与“可写作”的别名。
- **db_databases**（新）：PG/MySQL 服务器级数据库列表。连接固定在一个库，
  用户提到“这台机器上的另一个库”时先看它，再把 `database` 传给 `db_tables` / `db_table_schema` / `db_query` 切换。
- **schema**：PostgreSQL / 达梦的模式(owner)；MySQL 的库与 schema 同义，直接传 `schema`/`database` 均可。
- SQLite（单文件）与达梦不支持跨库切换，工具会明确报错提示正确姿势。
- 系统提示里注入“启动时连接目录快照”，列出一行一连接的别名；新增连接后以 `db_connections` 返回为准。

## 说明与限制

- 密码以明文写入连接文件（权限 0600）；生产环境建议使用 `cred:NAME`（走 DSH credentials 服务）或 `env:VAR`
- SQLite 走 Node 内置 `node:sqlite`（Node ≥ 22.5），无需编译原生模块
- MongoDB 连接需要指定 database；其“SQL 语句”接受 JSON：`{"collection":"...","filter":{...},"sort":{},"projection":{},"skip":0,"limit":50,"findOne":false}`
- 达梦默认按 Oracle 模式执行（分页用 ROWNUM、双引号标识符）；如实例是 MySQL 兼容模式，请在连接里选择“MySQL 兼容模式”
- 只读模式下禁止多语句与写操作；非只读可执行多语句与 DML/DDL（自担风险）
- **连接复用**：数据类接口（表/结构/查询/预览等）复用按连接参数缓存的共享会话（空闲 60s 自动回收、总量上限 8、出错即重建、达梦单连接操作串行化），避免每个请求重复建连；「测试连接」始终新建独占连接以验证真实连通性；保存/删除连接会立即失效对应缓存

## 左侧菜单 & 界面入口（DSH Web）

Web 端集成走 DSH slot 模型，与内置插件同构：

- `apply` 通过 `ctx.slots.inject/register` 挂两条 slot：
  - **`sidebar.footer.action`** list slot 新增一个 entry（id=`database`，order=-10），渲染底部入口按钮（往返开关）
  - **`conversation.view`** list/session slot 注册工作台 View（id=`database`，与 Chat/Trajectory 并列渲染）
- 工作台打开时接管整个中栏（参考番茄工作台）：持久容器以 `absolute inset:0` 覆盖
  到 Conversation 根节点上，自带顶栏替代会话头部；**不隐藏、不修改任何宿主元素**
  （覆盖缺席的最坏结果是 chat 照常显示，不会白屏）。App 通过持久 React root 挂载
  一次，View 切换 / 会话切换 / 关闭再打开均保留已开 Tab 与查询状态
- bundle 的 factory 接收 DSH loader 给的 `require`，**React/ReactDOM 走 host 静态模块**（不做内联），保证 dispatcher 与 host 一致、避免 `useSyncExternalStore` 跨实例 `de.current` 为 null
- bundle 在 DSH 外环境（普通页面）打开时退化为右下角悬浮独立预览

安装到 Web profile（`~/.dsh/profiles/web`）的完整步骤见 **`docs/INSTALL-WEB-PROFILE.md`**：
`pnpm add` link 依赖 → `dsh.profile.bundles` 追加 `@snowlocked/dsh-database-console` → 重启 `dsh web` →
Settings → Plugins 可见可管理。
