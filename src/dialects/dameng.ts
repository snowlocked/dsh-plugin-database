import type { ConnectionRecord, DialectSession, QueryResult, RunQueryOptions } from '../types.ts'
import { DbConsoleError, wrapError } from '../errors.ts'
import { serializeCell } from '../serialize.ts'
import { isReadOnlyStatement, normalizeSchema, quotePg, singleStatement , capReadSelect, escapeLike } from '../sqlutil.ts'

type DmdbModule = {
  default?: Record<string, unknown>
  getConnection?: unknown
  OUT_FORMAT_OBJECT?: number
  OUT_FORMAT_ARRAY?: number
} & Record<string, unknown>

interface DmResult {
  rows?: unknown[]
  rowsAffected?: number
  metaData?: unknown
}

interface DmConn {
  execute(sql: string, bindParams?: unknown[], options?: Record<string, unknown>): Promise<DmResult>
  close(): Promise<void>
}

let dmdbPromise: Promise<DmdbModule> | null = null

/** 异步加载 dmdb 驱动（失败时给出安装/平台提示）。 */
async function loadDmdb(): Promise<DmdbModule> {
  if (!dmdbPromise) {
    dmdbPromise = import('dmdb')
      .then((mod) => (mod.default && typeof mod.default === 'object' ? mod.default as DmdbModule : mod as DmdbModule))
      .catch((reason: unknown) => {
        dmdbPromise = null
        throw wrapError(
          reason,
          '达梦驱动 dmdb 未能加载：请确认安装插件时已带上 dmdb 依赖（npm 会自动安装），且当前平台受支持',
          'DM_DRIVER_MISSING',
          500,
        )
      })
  }
  return dmdbPromise
}

/** 从 dmdb 的 Result.metaData 中提取列名（支持单对象/列数组/多结果集二维数组）。 */
function dmColumnsOf(metaData: unknown): string[] {
  if (!metaData || typeof metaData !== 'object') return []
  const extract = (entry: unknown): string => {
    if (entry && typeof entry === 'object' && 'name' in (entry as Record<string, unknown>)) {
      return String((entry as { name: unknown }).name ?? '')
    }
    return ''
  }
  if (Array.isArray(metaData)) {
    if (metaData.length === 0) return []
    if (Array.isArray(metaData[0])) {
      // 多结果集：取第一个结果集
      return (metaData[0] as unknown[]).map(extract).filter(Boolean)
    }
    return metaData.map(extract).filter(Boolean)
  }
  const single = extract(metaData)
  return single ? [single] : []
}

export function createDamengSession(record: ConnectionRecord): DialectSession {
  let conn: DmConn | null = null
  const oracleMode = record.dmCompat !== 'mysql'

  const defaultOwner = (): string => (record.schema?.trim() || record.user?.trim() || '').toUpperCase()

  return {
    schemaAware: true,
    async open() {
      if (conn) return
      const dmdb = await loadDmdb()
      const getConnection = dmdb.getConnection as ((attrs: Record<string, unknown>) => Promise<DmConn>) | undefined
      if (typeof getConnection !== 'function') {
        throw new DbConsoleError('达梦驱动 dmdb 缺少 getConnection API，请升级 dmdb 后重试', 'DM_DRIVER_API', 500)
      }
      const host = record.host?.trim()
      if (!host) throw new DbConsoleError('达梦连接缺少主机地址', 'INVALID_CONNECTION', 400)
      const attrs: Record<string, unknown> = {
        user: record.user,
        password: record.password,
        connectString: `${host}:${record.port ?? 5236}`,
        autoCommit: true,
        connectTimeout: 8_000,
        socketTimeout: 60_000,
      }
      if (record.schema?.trim()) attrs.schema = record.schema.trim()
      if (record.dmCompat) attrs.compatibleMode = record.dmCompat
      // Node ≥17 使用 OpenSSL3：DM 默认的旧 RC4/DES 消息加密会报 0308010C unsupported，
      // 勾选“兼容 OpenSSL3”后关闭登录/消息加密（loginEncrypt=false）
      if (record.dmNoEncrypt === true) attrs.loginEncrypt = false
      let candidate: DmConn
      try {
        candidate = await getConnection(attrs)
      } catch (reason) {
        const detail = reason instanceof Error ? reason.message : String(reason)
        const opensslHint = /0308010C|digital envelope|legacy provider|unsupported/iu.test(detail)
          ? '；检测到 OpenSSL3 与达梦旧加密算法不兼容（0308010C 消息加密失败）：请在连接设置勾选「兼容 OpenSSL3：关闭登录/消息加密」后重试（仅建议可信内网使用）'
          : ''
        throw wrapError(
          reason,
          `无法连接达梦数据库（${host}:${record.port ?? 5236}），请检查地址、端口、账号与网络${opensslHint}`,
          'DM_CONNECT',
          502,
        )
      }
      let probed = false
      for (const probe of ['select 1 from dual', 'select 1']) {
        try {
          await candidate.execute(probe)
          probed = true
          break
        } catch {
          // 尝试下一条探测语句
        }
      }
      if (!probed) {
        await candidate.close().catch(() => undefined)
        throw new DbConsoleError(`达梦连接已建立但探测语句执行失败（${host}:${record.port ?? 5236}），请确认登录账号可访问`, 'DM_PROBE', 502)
      }
      conn = candidate
    },
    async close() {
      if (!conn) return
      const current = conn
      conn = null
      await current.close().catch(() => undefined)
    },
    async listSchemas() {
      const result = await exec(
        `select distinct owner as "NAME" from all_objects
         where object_type in ('TABLE','VIEW','MATERIALIZED VIEW')
         order by owner`,
      )
      const names = [...new Set(result.rows?.map((row) => String((row as Record<string, unknown>).NAME ?? '').trim()).filter(Boolean) ?? [])]
      if (names.length === 0 && defaultOwner()) return [{ name: defaultOwner(), kind: 'owner' as const }]
      return names.map((name) => ({ name, kind: 'owner' as const }))
    },
    async listTables(schema) {
      const owner = pickOwner(schema)
      const result = await exec(
        `select table_name as "NAME", 'table' as "KIND" from all_tables where owner = ?
         union all
         select view_name as "NAME", 'view' as "KIND" from all_views where owner = ?
         order by "NAME"`,
        [owner, owner],
      )
      return (result.rows ?? []).map((row) => {
        const value = row as Record<string, unknown>
        return {
          name: String(value.NAME ?? ''),
          kind: String(value.KIND ?? '') === 'view' ? ('view' as const) : ('table' as const),
        }
      })
    },
    async tableColumns(table, schema) {
      const owner = pickOwner(schema)
      const result = await exec(
        `select column_name as "NAME", data_type as "DATA_TYPE", data_length as "DATA_LENGTH",
                nullable as "NULLABLE", data_default as "DATA_DEFAULT"
         from all_tab_columns
         where owner = ? and table_name = ?
         order by column_id`,
        [owner, table.toUpperCase()],
      )
      const pkColumns = new Set<string>()
      try {
        const pk = await exec(
          `select cc.column_name as "NAME"
           from all_constraints c
           join all_cons_columns cc
             on c.constraint_name = cc.constraint_name and c.owner = cc.owner
           where c.constraint_type = 'P' and c.owner = ? and c.table_name = ?`,
          [owner, table.toUpperCase()],
        )
        for (const row of pk.rows ?? []) {
          const name = String((row as Record<string, unknown>).NAME ?? '').trim()
          if (name) pkColumns.add(name)
        }
      } catch {
        // 无权限读取约束时忽略主键标记
      }
      return (result.rows ?? []).map((row) => {
        const value = row as Record<string, unknown>
        const type = String(value.DATA_TYPE ?? '')
        const length = Number(value.DATA_LENGTH)
        return {
          name: String(value.NAME ?? ''),
          type: length > 0 && Number.isFinite(length) && /CHAR|VARCHAR|RAW/u.test(type) ? `${type}(${length})` : type,
          nullable: String(value.NULLABLE ?? 'Y') === 'Y',
          primary: pkColumns.has(String(value.NAME ?? '')),
          defaultValue: value.DATA_DEFAULT === null || value.DATA_DEFAULT === undefined ? null : String(value.DATA_DEFAULT),
        }
      })
    },
    async preview(table, schema, limit, offset, options) {
      const owner = pickOwner(schema)
      const quoted = `${quotePg(owner)}.${quotePg(table)}`
      const safeLimit = clampInt(limit, 1, 100_000)
      const safeOffset = Math.max(0, Math.trunc(offset) || 0)
      const cap = Math.min(safeLimit + safeOffset, 100_000)
      const where: string[] = []
      const values: unknown[] = []
      for (const [name, raw] of Object.entries(options?.filters ?? {})) {
        const text = String(raw ?? '').trim()
        if (!text || name.length > 128) continue
        where.push(`${quotePg(name)} like ? escape '\\'`)
        values.push(`%${escapeLike(text)}%`)
      }
      const order = options?.sort?.column
        ? ` order by ${quotePg(options.sort.column)} ${options.sort.dir === 'desc' ? 'desc' : 'asc'}`
        : ''
      const base = `select * from ${quoted}${where.length > 0 ? ` where ${where.join(' and ')}` : ''}${order}`
      const result = oracleMode
        ? await runSelect(`select * from (${base}) where rownum <= ${safeOffset + safeLimit + 1}`, values)
        : await runSelect(`${base} limit ${safeLimit + 1} offset ${safeOffset}`, values)
      const fetched = result.rows.length
      if (oracleMode) {
        const hasMore = fetched > safeOffset + safeLimit
        result.rows = result.rows.slice(safeOffset, safeOffset + safeLimit)
        result.truncated = hasMore
        result.total = hasMore ? undefined : fetched
      } else {
        const hasMore = fetched > safeLimit
        if (hasMore) result.rows = result.rows.slice(0, safeLimit)
        result.truncated = hasMore
        result.total = hasMore ? undefined : safeOffset + fetched
      }
      result.rowCount = result.rows.length
      return result
    },
    async updateCell(input) {
      if (input.pk.length === 0) throw new DbConsoleError('缺少主键，无法定位要更新的行', 'CELL_NO_PK', 400)
      const owner = pickOwner(input.schema)
      const sql = `update ${quotePg(owner)}.${quotePg(input.table)}
        set ${quotePg(input.column)} = ?
        where ${input.pk.map((entry) => `${quotePg(entry.column)} = ?`).join(' and ')}`
      try {
        const result = await exec(sql, [input.value, ...input.pk.map((entry) => entry.value)])
        return { affectedRows: Number(result.rowsAffected ?? 0) }
      } catch (reason) {
        throw wrapError(reason, '单元格更新失败', 'DM_UPDATE', 502)
      }
    },
    async runQuery(options) {
      const statement = singleStatement(options.sql)
      if (!statement) throw new DbConsoleError('SQL 为空', 'EMPTY_SQL', 400)
      if (options.readOnly && !isReadOnlyStatement(statement)) {
        throw new DbConsoleError('只读模式禁止执行非查询语句（如需写入，请取消“只读”开关后重试）', 'WRITE_BLOCKED', 400)
      }
      const capPlan = options.readOnly && !oracleMode
        ? capReadSelect(statement, options.hardLimit)
        : { sql: statement, capped: false }
      const started = Date.now()
      const dmdb = await loadDmdb()
      const result = await execWithOptions(capPlan.sql, options.params ?? [], {
        maxRows: options.hardLimit + 1,
        outFormat: dmdb.OUT_FORMAT_OBJECT ?? 2,
      })
      const normalized = normalizeDmResult(result, options.hardLimit)
      normalized.durationMs = Date.now() - started
      if (capPlan.capped) {
        normalized.message = `结果已自动限制为前 ${options.hardLimit} 行（原语句未写 LIMIT）。如需更多，调大“每页数量”后重新执行。`
      }
      return normalized
    },
  }

  function pickOwner(schema?: string): string {
    const target = normalizeSchema(schema)
    if (target) return target
    const owner = defaultOwner()
    if (owner) return owner
    throw new DbConsoleError('达梦连接需要填写「用户」或「schema」字段，才能确定默认模式', 'DM_NO_OWNER', 400)
  }

  async function exec(sql: string, params: unknown[] = []): Promise<DmResult> {
    const dmdb = await loadDmdb()
    return execWithOptions(sql, params, { maxRows: 0, outFormat: dmdb.OUT_FORMAT_OBJECT ?? 2 })
  }

  async function execWithOptions(
    sql: string,
    params: unknown[],
    options: Record<string, unknown>,
  ): Promise<DmResult> {
    const session = conn
    if (!session) throw new DbConsoleError('达梦会话尚未打开', 'NOT_OPEN', 500)
    try {
      return await session.execute(sql, params.length > 0 ? params : undefined, options)
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : String(reason)
      throw wrapError(reason, `达梦 SQL 执行失败：${message.slice(0, 300)}`, 'DM_QUERY', 502)
    }
  }

  async function runSelect(sql: string, params: unknown[] = []): Promise<QueryResult> {
    const dmdb = await loadDmdb()
    const started = Date.now()
    const result = await execWithOptions(sql, params, { maxRows: 100_001, outFormat: dmdb.OUT_FORMAT_OBJECT ?? 2 })
    const normalized = normalizeDmResult(result, 100_000)
    normalized.durationMs = Date.now() - started
    return normalized
  }
}

function normalizeDmResult(result: DmResult, hardLimit: number): QueryResult {
  const columns = dmColumnsOf(result.metaData)
  const rawRows = result.rows ?? []
  const rows: unknown[][] = []
  for (const raw of rawRows) {
    if (Array.isArray(raw)) {
      rows.push(raw.map((cell) => serializeCell(cell)))
    } else if (raw && typeof raw === 'object') {
      const object = raw as Record<string, unknown>
      rows.push(
        columns.length > 0
          ? columns.map((column) => serializeCell(object[column] ?? object[column.toUpperCase()] ?? object[column.toLowerCase()]))
          : Object.keys(object).map((key) => serializeCell(object[key])),
      )
    } else {
      rows.push([serializeCell(raw)])
    }
  }
  let resolvedColumns = columns
  if (resolvedColumns.length === 0 && rows.length > 0) {
    const width = Math.max(...rows.map((row) => row.length))
    resolvedColumns = Array.from({ length: width }, (_unused, index) => `col${index + 1}`)
  }
  const truncated = rows.length > hardLimit
  const finalRows = truncated ? rows.slice(0, hardLimit) : rows
  const rowsAffected = typeof result.rowsAffected === 'number' ? result.rowsAffected : undefined
  const change = rowsAffected !== undefined && rawRows.length === 0
  return {
    columns: resolvedColumns,
    rows: finalRows,
    rowCount: finalRows.length,
    affectedRows: change ? rowsAffected : undefined,
    durationMs: 0,
    truncated,
    kind: change ? 'change' : 'select',
    ...(change ? { message: `影响行数：${rowsAffected}` } : {}),
  }
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.trunc(value)))
}
