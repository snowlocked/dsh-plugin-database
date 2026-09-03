import type { Document, MongoClient } from 'mongodb'
import type { ConnectionRecord, DialectSession, QueryResult, RunQueryOptions } from '../types.ts'
import { DbConsoleError, wrapError } from '../errors.ts'
import { serializeCell } from '../serialize.ts'

type Doc = Document

interface MongoEnvelope {
  filter?: unknown
  sort?: unknown
  projection?: unknown
  skip?: number
  limit?: number
  findOne?: boolean
}

export function createMongodbSession(record: ConnectionRecord): DialectSession {
  let client: MongoClient | null = null
  let dbName = record.database?.trim() ?? ''

  const buildUri = (): string => {
    const host = record.host?.trim()
    if (!host) throw new DbConsoleError('MongoDB 连接缺少主机地址', 'INVALID_CONNECTION', 400)
    if (!dbName) throw new DbConsoleError('MongoDB 连接需要指定数据库名（database）', 'INVALID_CONNECTION', 400)
    const port = record.port ?? 27017
    const user = record.user ? encodeURIComponent(record.user) : ''
    const password = record.password ? encodeURIComponent(record.password) : ''
    const credentials = user ? `${user}:${password}@` : ''
    const params = new URLSearchParams()
    if (record.authSource) params.set('authSource', record.authSource)
    else if (user) params.set('authSource', 'admin')
    if (record.ssl) params.set('tls', 'true')
    // 允许 options 提供额外参数（directConnection=true 等）
    for (const [key, value] of Object.entries(record.options ?? {})) {
      if (!['sslCa'].includes(key)) params.set(key, value)
    }
    const query = params.toString()
    return `mongodb://${credentials}${host}:${port}/${encodeURIComponent(dbName)}${query ? `?${query}` : ''}`
  }

  return {
    schemaAware: false,
    async open() {
      if (client) return
      const { MongoClient: RealMongoClient } = await import('mongodb')
      const uri = buildUri()
      const candidate = new RealMongoClient(uri, { serverSelectionTimeoutMS: 8_000 })
      try {
        await candidate.connect()
        await candidate.db(dbName).command({ ping: 1 })
      } catch (reason) {
        await candidate.close().catch(() => undefined)
        throw wrapError(
          reason,
          `无法连接 MongoDB（${record.host}:${record.port ?? 27017}/${dbName}），请检查地址、账号、认证库与网络`,
          'MONGO_CONNECT',
          502,
        )
      }
      client = candidate
    },
    async close() {
      if (!client) return
      const current = client
      client = null
      await current.close().catch(() => undefined)
    },
    async listSchemas() {
      // 保持当前 database，不做跨库浏览（减少误连风险）
      return [{ name: dbName, kind: 'database' }]
    },
    async listTables() {
      const collections = await current().db(dbName).listCollections({}, { nameOnly: true }).toArray()
      return collections.map((entry) => ({
        name: entry.name,
        kind: 'collection' as const,
      }))
    },
    async tableColumns(collectionName) {
      const collection = current().db(dbName).collection(collectionName)
      const sample = await collection.find({}).limit(3).toArray()
      if (sample.length === 0) {
        return [{ name: '_id', type: 'objectid', nullable: false, primary: true }]
      }
      const columns: { name: string; type: string }[] = []
      const seen = new Set<string>()
      for (const doc of sample) {
        for (const [key, value] of Object.entries(doc)) {
          if (seen.has(key)) continue
          seen.add(key)
          columns.push({ name: key, type: valueType(value) })
        }
      }
      return columns.map((column) => ({
        name: column.name,
        type: column.type,
        nullable: true,
        primary: column.name === '_id',
      }))
    },
    async preview(collectionName, _schema, limit, offset, options) {
      const collection = current().db(dbName).collection(collectionName)
      const filterDoc: Record<string, unknown> = {}
      for (const [name, raw] of Object.entries(options?.filters ?? {})) {
        const text = String(raw ?? '').trim()
        if (!text) continue
        // 逐字符转义正则元字符，把输入当字面量做包含匹配
        const escapedText = [...text].map((ch) => /[\^$.|?*+()\[\]{}]/.test(ch) ? `\${ch}` : ch).join('')
        filterDoc[name] = { $regex: escapedText, $options: 'i' }
      }
      const sortDoc: Record<string, 1 | -1> = {}
      if (options?.sort?.column) sortDoc[options.sort.column] = options.sort.dir === 'desc' ? -1 : 1
      const cursor = collection.find(filterDoc)
      if (options?.sort?.column) cursor.sort(sortDoc)
      const want = clampInt(limit, 1, 9_999) + 1
      const docs = await cursor.skip(offset).limit(Math.min(want, 10_000)).toArray()
      const result = docsResult(docs)
      const hasMore = result.rows.length > clampInt(limit, 1, 9_999)
      if (hasMore) result.rows = result.rows.slice(0, clampInt(limit, 1, 9_999))
      result.rowCount = result.rows.length
      result.truncated = hasMore
      result.total = hasMore ? undefined : offset + result.rows.length
      return result
    },
    async runQuery(options) {
      // MongoDB 的“查询语句”接受 JSON：过滤器或 { filter, sort, projection, skip, limit, findOne }
      const envelope = parseMongoQuery(options.sql)
      const collectionName = (envelope as { collection?: string }).collection
      const collection = collectionName
        ? current().db(dbName).collection(String(collectionName))
        : null
      if (!collection) {
        throw new DbConsoleError('MongoDB 查询需要提供 collection 字段（JSON 中的集合名）', 'MONGO_QUERY', 400)
      }
      const started = Date.now()
      let docs: Doc[] = []
      let findOne = false
      try {
        const { filter, sort, projection, skip, limit, findOne: one } = envelope as MongoEnvelope
        const filterDoc = (filter ?? {}) as Document
        const sortDoc = (sort ?? {}) as Document
        const projectionDoc = (projection ?? {}) as Document
        findOne = one === true
        const cursor = collection.find(filterDoc)
        if (sort && typeof sort === 'object') cursor.sort(sortDoc)
        if (projection && typeof projection === 'object') cursor.project(projectionDoc)
        if (typeof skip === 'number' && skip > 0) cursor.skip(Math.trunc(skip))
        const max = clampInt(typeof limit === 'number' ? limit : 100, 1, 10_000)
        cursor.limit(max)
        docs = findOne ? (await cursor.toArray()).slice(0, 1) : await cursor.toArray()
      } catch (reason) {
        throw wrapError(reason, 'MongoDB 查询失败（请检查 JSON 过滤器语法）', 'MONGO_QUERY', 502)
      }
      const result = docsResult(docs, Date.now() - started)
      return {
        ...result,
        message: findOne ? 'findOne 结果' : `find 结果（${result.rowCount} 条）`,
      }
    },
  }

  function current(): MongoClient {
    if (!client) throw new DbConsoleError('MongoDB 会话尚未打开', 'NOT_OPEN', 500)
    return client
  }
}

function parseMongoQuery(raw: string): Record<string, unknown> {
  const text = raw.trim()
  if (!text) throw new DbConsoleError('MongoDB 查询为空', 'EMPTY_QUERY', 400)
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (reason) {
    throw new DbConsoleError(
      `MongoDB 查询需要 JSON 格式，例如 {"collection":"users","filter":{"age":{"$gt":18}},"limit":50}（解析失败：${(reason as Error).message}）`,
      'MONGO_QUERY',
      400,
    )
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new DbConsoleError('MongoDB 查询必须是 JSON 对象', 'MONGO_QUERY', 400)
  }
  const record = parsed as Record<string, unknown>
  if (typeof record.collection !== 'string') {
    throw new DbConsoleError('MongoDB 查询 JSON 缺少 collection 字段（集合名）', 'MONGO_QUERY', 400)
  }
  return record
}

function valueType(value: unknown): string {
  if (value === null || value === undefined) return 'null'
  if (Array.isArray(value)) return 'array'
  const ctor = (value as { constructor?: { name?: string } }).constructor?.name
  switch (ctor) {
    case 'ObjectId': return 'objectid'
    case 'Long': return 'long'
    case 'Int32': return 'int32'
    case 'Double': return 'double'
    case 'Decimal128': return 'decimal128'
    case 'Binary': return 'binary'
    case 'Date': return 'date'
    case 'RegExp': return 'regex'
    default:
      return typeof value
  }
}

function docsResult(docs: Doc[], durationMs = 0): QueryResult {
  const columns: string[] = []
  const seen = new Set<string>()
  const rows: unknown[][] = []
  for (const doc of docs) {
    const row: unknown[] = columns.map(() => undefined)
    for (const [key, value] of Object.entries(doc)) {
      let index = columns.indexOf(key)
      if (index < 0) {
        columns.push(key)
        index = columns.length - 1
        for (const previous of rows) previous.push(undefined)
      }
      row[index] = serializeCell(value)
    }
    rows.push(row)
  }
  return {
    columns,
    rows,
    rowCount: rows.length,
    durationMs,
    truncated: false,
    kind: 'select',
  }
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.trunc(value)))
}