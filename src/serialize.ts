/** 把数据库驱动返回的任意值转成可 JSON 序列化的值（递归处理嵌套对象/数组）。 */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

/** 驱动专有类型（Date/Buffer/ObjectId/Long/Decimal128/Lob 等）的叶子转换。 */
function leaf(value: object): unknown {
  if (value instanceof Date) return value.toISOString()
  if (Buffer.isBuffer(value)) {
    return {
      __type: 'buffer',
      hex: value.toString('hex'),
      preview: value.toString('utf8').slice(0, 120),
    }
  }
  const ctor = (value as { constructor?: { name?: string } }).constructor?.name
  const asRecord = value as Record<string, unknown>
  if (ctor === 'ObjectId' && typeof asRecord.toHexString === 'function') {
    return { __type: 'objectid', value: asRecord.toHexString() as string }
  }
  if (ctor === 'Long' || ctor === 'Int32' || ctor === 'Double' || ctor === 'Decimal128' || ctor === 'Binary') {
    if (typeof asRecord.toString === 'function') {
      return { __type: ctor.toLowerCase(), value: (asRecord.toString as () => string)() }
    }
  }
  if (typeof asRecord.toISOString === 'function') return asRecord.toISOString() as string
  if (typeof asRecord.toString === 'function') {
    const text = (asRecord.toString as () => string)()
    if (text && text !== '[object Object]') return text
  }
  return String(value)
}

export function serializeCell(value: unknown): unknown {
  if (value === null || value === undefined) return value
  const type = typeof value
  if (type === 'string' || type === 'boolean' || type === 'number') return value
  if (type === 'bigint') {
    const big = value as bigint
    return big <= BigInt(Number.MAX_SAFE_INTEGER) && big >= BigInt(Number.MIN_SAFE_INTEGER)
      ? Number(big)
      : big.toString()
  }
  if (type === 'symbol' || type === 'function') return String(value)
  if (Array.isArray(value)) return value.map((item) => serializeCell(item))
  if (isPlainObject(value)) {
    const record: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(value)) record[key] = serializeCell(entry)
    return record
  }
  return leaf(value as object)
}

/** 行对象列表 → 列名（以所有对象的键并集为准，保序）。 */
export function columnsOfObjects(records: Array<Record<string, unknown>>): string[] {
  const columns: string[] = []
  const seen = new Set<string>()
  for (const record of records) {
    for (const key of Object.keys(record)) {
      if (!seen.has(key)) { seen.add(key); columns.push(key) }
    }
  }
  return columns
}
