# 安装到 DSH Web profile（左侧菜单入口 + 工作台面板）

本插件的 Web 集成走 DSH slot 模型，与内置插件（dsh-free-search、tomato-board、dsh-ssh）同构：

- 客户端 bundle 以 `window.__ModuleLoader__.load({ id, factory: (require) => {...} })` 注册；
  React/ReactDOM 留作 external，bundle 通过 `require('react')` 拿到 host 静态模块
  里的 React 实例（dispatcher 与主机一致，不会触发 "useSyncExternalStore null deref"）。
- `apply(ctx)` 通过 `ctx.slots.inject/register` 挂三条 slot：
  - **`sidebar.footer.action`** list slot 新增 entry `id=database, order=-10`（底部「数据库」入口按钮）；
  - **`database.console`** 自定义 single root slot `id=dsh`（含子 slot `database.console.toolbar`）；
  - **`shell.overlay`** list slot 注册 host `id=database.console`，host 内部
    `props.renderSlot('database.console', owner)` 把工作台嵌入 layout 已声明的
    frame-wide 浮层。host 用 ResizeObserver 跟 sidebar 宽度，wrapper 定位到
    `left: <sidebarWidth>`，避免遮住侧栏。
- 无 `__ModuleLoader__` 的普通页面打开同一 bundle 会退化为独立预览（右下角悬浮按钮）。

## 一、准备插件包

```bash
cd D:\Users\wuzan\project\dsh-plugin-database
npm install          # 首次
npm run build        # 产出 plugins/dsh-database-console/lib/index.js（服务端）与 lib/client.js（浏览器端）
```

产物目录 `plugins/dsh-database-console/` 即为可安装包：

```
plugins/dsh-database-console/
├── package.json          # main=lib/index.js, exports["."], ["./client"], dsh 元信息
├── cordis.patch.yml      # loader 补丁行（insert id=dsh-database-console）
└── lib/
    ├── index.js          # 服务端插件（cordis apply：webServer/tools/systemPrompt）
    └── client.js         # 浏览器端模块（__ModuleLoader__ 注册 + apply）
```

## 二、加入 Web profile（以 ~/.dsh/profiles/web 为例）

DSH 的 web profile 是一个 pnpm 工程：`package.json` 的 `dsh.profile.bundles`
列出已安装的 UI 插件包（如 `dsh-free-search`、`@stephenlgf/dsh-tomato-board`），
`dependencies` 保存对应依赖。

1. **添加依赖（本地 link）**

   在 `D:\Users\wuzan\.dsh\profiles\web` 下执行：

   ```bash
   pnpm add "@snowlocked/dsh-database-console@link:D:/Users/wuzan/project/dsh-plugin-database/plugins/dsh-database-console"
   ```

   或手工编辑 `profiles/web/package.json`：

   ```json
   "dependencies": {
     "@snowlocked/dsh-database-console": "link:D:/Users/wuzan/project/dsh-plugin-database/plugins/dsh-database-console"
   }
   ```

   然后 `pnpm install`（会为 link 包生成 node_modules 软链；驱动依赖 dmdb/mongodb/mysql2/pg
   由插件包自带，服务端运行时从其包内 node_modules 解析——若安装工具不递归安装 link 包的依赖，
   把四个驱动复制/安装到 `profiles/web/node_modules` 或插件包内亦可，服务端在 try/catch 中懒加载驱动，
   缺失时只影响对应数据库类型，不影响其他功能）。

2. **注册到 bundles 列表**：在 `profiles/web/package.json` 的 `dsh.profile.bundles`
   数组中追加 `"@snowlocked/dsh-database-console"`。

3. **重启 DSH**（`dsh web`）。loader 按 bundles 顺序扫描每个包的
   `dsh.bundle.patch`（即插件的 `cordis.patch.yml`），生成
   `- insert: - id: dsh-database-console …` 补丁行，服务端模块被 cordis 加载，
   客户端模块随 GUI 页面加载。

4. 在 **Settings → Plugins**（dsh-plugin-console）中应能看到 `dsh-database-console`，
   可在这里改配置 / 卸载。

> 也可直接使用插件管理面板「添加本地插件」：选择 `plugins/dsh-database-console`
> 目录（其 package.json + cordis.patch.yml 即 loader 契约），面板会代为完成以上 1–2 步。

## 三、验证

- 探活：DSH 的 webServer 只注册 POST 路由，用 POST 调 `/state`（返回含 `storeFile`、`maxRows`、`supportedTypes`）：
  ```bash
  curl -X POST http://127.0.0.1:3080/api/dsh-database-console/state -H "content-type: application/json" -d {}
  ```
- 左侧边栏出现「数据库」入口行 → 点击接管中栏 → 四个页签：连接管理 / 数据浏览 / SQL 控制台 / 自然语言查询。
- 对话中让 AI「查一下数据库」→ 走 `db_connections / db_tables / db_table_schema / db_query` 工具。
- 无 DSH 环境时打开 `dist/dsh-database-console.client.js`（如 file:// 或任意静态页）：
  右下角出现悬浮按钮，即独立预览模式。

## 四、卸载 / 排障

- 卸载：从 `profiles/web/package.json` 移除 bundles 条目与 dependencies 条目，重启。
- 客户端没出现入口：F12 查看 console，是否有 `[dsh-database-console] mount failed`；
  通常原因是没有重启 dsh web，或 bundle 未被加入 bundles 列表。
- 某个数据库类型连不上：看服务端日志（驱动未安装/平台不支持会打印明确中文提示）。
