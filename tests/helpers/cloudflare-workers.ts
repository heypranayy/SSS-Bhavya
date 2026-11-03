/**
 * Vitest stand-in for the `cloudflare:workers` module (aliased in vitest.config.mjs).
 * `env.DB` is a D1-compatible wrapper over an in-memory node:sqlite database with
 * migrations/ applied and the seed data loaded; `env.BUCKET` is an in-memory R2.
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
  SEED_CATALOGS,
  SEED_CATEGORIES,
  SEED_COLLECTIONS,
  SEED_CUSTOMERS,
  SEED_INQUIRIES,
  SEED_PRODUCTS,
  SEED_TICKETS,
} from '../../src/lib/data/seed-data';
import { COLUMNS_FOR } from '../../src/lib/db/rows';

type Value = string | number | null;

class Statement {
  constructor(private db: DatabaseSync, private sql: string, private params: Value[] = []) {}

  bind(...params: unknown[]) {
    return new Statement(this.db, this.sql, params.map((p) => (p === undefined ? null : (p as Value))));
  }

  async all<T>() {
    const results = this.db.prepare(this.sql).all(...this.params) as T[];
    return { results, success: true, meta: {} };
  }

  async first<T>(column?: string): Promise<T | null> {
    const row = this.db.prepare(this.sql).get(...this.params) as Record<string, unknown> | undefined;
    if (!row) return null;
    return (column ? row[column] : row) as T;
  }

  async run() {
    const res = this.db.prepare(this.sql).run(...this.params);
    return { success: true, results: [], meta: { changes: Number(res.changes), last_row_id: Number(res.lastInsertRowid) } };
  }
}

function createTestDb() {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON');
  const dir = path.resolve(import.meta.dirname, '../../migrations');
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    db.exec(readFileSync(path.join(dir, file), 'utf-8'));
  }

  const seed: Array<[keyof typeof COLUMNS_FOR, Array<{ id: string }>]> = [
    ['products', SEED_PRODUCTS],
    ['categories', SEED_CATEGORIES],
    ['collections', SEED_COLLECTIONS],
    ['catalogs', SEED_CATALOGS],
    ['customers', SEED_CUSTOMERS],
    ['inquiries', SEED_INQUIRIES],
    ['support_tickets', SEED_TICKETS],
  ];
  for (const [table, docs] of seed) {
    for (const doc of docs) {
      const columns = COLUMNS_FOR[table]!(doc);
      const names = ['id', ...Object.keys(columns), 'data'];
      db.prepare(`INSERT INTO ${table} (${names.join(', ')}) VALUES (${names.map(() => '?').join(', ')})`).run(
        doc.id,
        ...(Object.values(columns) as Value[]),
        JSON.stringify(doc)
      );
    }
  }

  return {
    prepare: (sql: string) => new Statement(db, sql),
    async batch(statements: Statement[]) {
      db.exec('BEGIN');
      try {
        const results = [];
        for (const s of statements) results.push(await s.run());
        db.exec('COMMIT');
        return results;
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    },
    async exec(sql: string) {
      db.exec(sql);
      return { count: 0, duration: 0 };
    },
  };
}

function createTestBucket() {
  const objects = new Map<string, { body: Uint8Array; contentType?: string }>();
  return {
    objects,
    async put(key: string, value: ArrayBuffer | Uint8Array, opts?: { httpMetadata?: { contentType?: string } }) {
      objects.set(key, { body: new Uint8Array(value as ArrayBuffer), contentType: opts?.httpMetadata?.contentType });
      return { key };
    },
    async get(key: string) {
      const o = objects.get(key);
      if (!o) return null;
      return {
        body: new Blob([o.body as BlobPart]).stream(),
        httpEtag: `"${key}"`,
        writeHttpMetadata(headers: Headers) {
          if (o.contentType) headers.set('content-type', o.contentType);
        },
      };
    },
    async delete(key: string) {
      objects.delete(key);
    },
  };
}

export const env = {
  DB: createTestDb(),
  BUCKET: createTestBucket(),
};
