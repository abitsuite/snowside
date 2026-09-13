// packages/api/test/d1-mock.ts
// Minimal in-memory D1 mock for unit tests. Implements the subset used by
// the API: prepare().bind().run/first/all + raw exec for schema setup.
// NOT a real SQLite engine — values are stored as-is, types are loose.

type Row = Record<string, unknown>

interface Bound {
  sql: string
  params: unknown[]
}

class PreparedMock {
  private bound: unknown[] = []
  constructor(private db: InMemoryD1, private sql: string) {}

  bind(...params: unknown[]): this { this.bound = params; return this }

  private substitute(sql: string, params: unknown[]): string {
    let i = 0
    return sql.replace(/\?/g, () => {
      const v = params[i++]
      return typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : `${v ?? 'NULL'}`
    })
  }

  async run(): Promise<{ success: boolean; meta: { changes: number } }> {
    const sql = this.substitute(this.db.cleanSql(this.sql), this.bound)
    this.db.exec(sql)
    return { success: true, meta: { changes: this.db.lastChanges } }
  }

  async first(): Promise<Row | null> {
    const sql = this.substitute(this.db.cleanSql(this.sql), this.bound)
    const rows = this.db.query(sql)
    return rows.length > 0 ? rows[0] : null
  }

  async all(): Promise<{ results: Row[]; success: boolean; meta: object }> {
    const sql = this.substitute(this.db.cleanSql(this.sql), this.bound)
    const results = this.db.query(sql)
    return { results, success: true, meta: { changes: results.length } }
  }
}

export class InMemoryD1 implements D1Database {
  private tables: Map<string, Row[]> = new Map()
  public lastChanges = 0

  cleanSql(sql: string): string {
    // strip trailing semicolons / whitespace for exec()
    return sql.trim().replace(/;+\s*$/, '')
  }

  exec(sql: string): void {
    const clean = this.cleanSql(sql)
    // CREATE TABLE
    const create = clean.match(/CREATE TABLE IF NOT EXISTS (\w+)\s*\((.*)\)/is)
    if (create) {
      const [, name] = create
      if (!this.tables.has(name)) this.tables.set(name, [])
      this.lastChanges = 0
      return
    }
    // INSERT OR REPLACE INTO meta
    const insertMeta = clean.match(/INSERT OR REPLACE INTO meta\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i)
    if (insertMeta) {
      const [, keys, vals] = insertMeta
      const ks = keys.split(',').map(s => s.trim().replace(/['"]/g, ''))
      const vs = vals.split(',').map(s => s.trim().replace(/['"]/g, ''))
      const row: Row = {}
      ks.forEach((k, i) => (row[k] = vs[i]))
      this.tables.set('meta', [row])
      this.lastChanges = 1
      return
    }
    // INSERT INTO
    const insert = clean.match(/INSERT INTO (\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i)
    if (insert) {
      const [, name, keys, vals] = insert
      const ks = keys.split(',').map(s => s.trim())
      const vs = vals.split(',').map(s => {
        const v = s.trim()
        return v.startsWith("'") ? v.slice(1, -1).replace(/''/g, "'") : Number(v)
      })
      const row: Row = {}
      ks.forEach((k, i) => (row[k] = vs[i]))
      if (!this.tables.has(name)) this.tables.set(name, [])
      this.tables.get(name)!.push(row)
      this.lastChanges = 1
      return
    }
    // UPDATE
    const update = clean.match(/UPDATE (\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/is)
    if (update) {
      const [, name, setClause, whereClause] = update
      const rows = this.tables.get(name) ?? []
      let changed = 0
      for (const row of rows) {
        if (whereClause && !this.matchWhere(row, whereClause)) continue
        // parse SET assignments: "key = 'val', key2 = 123"
        for (const assign of setClause.split(',').map(s => s.trim())) {
          const [k, v] = assign.split('=').map(s => s.trim())
          const key = k.trim()
          let value: unknown = v.trim()
          if (typeof value === 'string') {
            if (value.startsWith("'")) value = value.slice(1, -1).replace(/''/g, "'")
            else if (/^\d+$/.test(value)) value = Number(value)
            else if (value === 'NULL') value = null
          }
          row[key] = value
        }
        changed++
      }
      this.lastChanges = changed
      return
    }
    // SELECT
    if (clean.toUpperCase().startsWith('SELECT')) {
      // no-op: queries handled by query()
      this.lastChanges = 0
      return
    }
    // fallback
    this.lastChanges = 0
  }

  query(sql: string): Row[] {
    const clean = this.cleanSql(sql)
    const sel = clean.match(/SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER BY\s+.+?)?$/is)
    if (!sel) return []
    const [, cols, table, where] = sel
    const rows = this.tables.get(table) ?? []
    const filtered = where ? rows.filter(r => this.matchWhere(r, where)) : rows
    if (cols.trim() === '*') return [...filtered]
    return filtered.map(r => {
      const out: Row = {}
      for (const c of cols.split(',').map(s => s.trim())) out[c] = r[c]
      return out
    })
  }

  private matchWhere(row: Row, where: string): boolean {
    // simple: "key = 'val'" or "key = ?" (already substituted) or "status IN ('a','b')"
    const inMatch = where.match(/(\w+)\s+IN\s*\(([^)]+)\)/i)
    if (inMatch) {
      const [, key, vals] = inMatch
      const list = vals.split(',').map(s => s.trim().replace(/['"]/g, ''))
      return list.includes(String(row[key]))
    }
    const eq = where.match(/(\w+)\s*=\s*(.+)$/)
    if (eq) {
      const [, key, val] = eq
      let v: unknown = val.trim()
      if (typeof v === 'string') {
        if (v.startsWith("'")) v = v.slice(1, -1).replace(/''/g, "'")
        else if (/^\d+$/.test(v)) v = Number(v)
      }
      // handle AND: "key = val AND key2 = val2"
      const parts = where.split(/\s+AND\s+/i)
      if (parts.length > 1) {
        return parts.every(part => {
          const p = part.match(/(\w+)\s*=\s*(.+)/)
          if (!p) return true
          let pv: unknown = p[2].trim()
          if (typeof pv === 'string') {
            if (pv.startsWith("'")) pv = pv.slice(1, -1).replace(/''/g, "'")
            else if (/^\d+$/.test(pv)) pv = Number(pv)
          }
          return String(row[p[1]]) === String(pv)
        })
      }
      return String(row[key]) === String(v)
    }
    // IS NOT NULL
    const notNull = where.match(/(\w+)\s+IS\s+NOT\s+NULL/i)
    if (notNull) return row[notNull[1]] != null
    return true
  }

  prepare(sql: string): PreparedMock {
    return new PreparedMock(this, sql)
  }

  // required by D1Database type but unused in tests
  batch(): Promise<unknown[]> { return Promise.resolve([]) }
  bind(): unknown { return {} }
  async dump(): Promise<Uint8Array> { return new Uint8Array() }
}

export function createInMemoryD1(): D1Database {
  return new InMemoryD1() as unknown as D1Database
}
