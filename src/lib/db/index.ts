import { env } from 'cloudflare:workers';
import type { D1Database, D1PreparedStatement, R2Bucket } from '@cloudflare/workers-types/index.ts';

export type { D1Database, D1PreparedStatement, R2Bucket };

/**
 * D1 document helpers. Every table has `id` + `data` (the full JSON record)
 * plus a few indexed columns; see migrations/0001_init.sql.
 */

export type DocTable =
  | 'products'
  | 'categories'
  | 'collections'
  | 'customers'
  | 'catalogs'
  | 'inquiries'
  | 'blogs'
  | 'support_tickets'
  | 'staff';

export type ColumnValue = string | number | null;

export function getDb(): D1Database {
  const db = (env as Partial<typeof env>).DB;
  if (!db) throw new Error('D1 binding "DB" is not configured (see wrangler.jsonc)');
  return db;
}

export function getBucket(): R2Bucket {
  const bucket = (env as Partial<typeof env>).BUCKET;
  if (!bucket) throw new Error('R2 binding "BUCKET" is not configured (see wrangler.jsonc)');
  return bucket;
}

function parse<T>(row: { data: string } | null | undefined): T | null {
  return row ? (JSON.parse(row.data) as T) : null;
}

export async function listDocs<T>(table: DocTable, orderBy?: string): Promise<T[]> {
  const sql = `SELECT data FROM ${table}${orderBy ? ` ORDER BY ${orderBy}` : ''}`;
  const { results } = await getDb().prepare(sql).all<{ data: string }>();
  return results.map((r) => JSON.parse(r.data) as T);
}

export async function getDoc<T>(table: DocTable, id: string): Promise<T | null> {
  const row = await getDb().prepare(`SELECT data FROM ${table} WHERE id = ?`).bind(id).first<{ data: string }>();
  return parse<T>(row);
}

/** First document where `column = value` (column must be one of the table's own columns). */
export async function findDoc<T>(table: DocTable, column: string, value: string): Promise<T | null> {
  const row = await getDb()
    .prepare(`SELECT data FROM ${table} WHERE ${column} = ? LIMIT 1`)
    .bind(value)
    .first<{ data: string }>();
  return parse<T>(row);
}

/** Builds an upsert statement; `columns` are the indexed columns besides id/data. */
export function upsertStatement(
  table: DocTable,
  id: string,
  columns: Record<string, ColumnValue>,
  data: unknown
): D1PreparedStatement {
  const names = ['id', ...Object.keys(columns), 'data'];
  const values = [id, ...Object.values(columns), JSON.stringify(data)];
  const updates = names
    .slice(1)
    .map((n) => `${n} = excluded.${n}`)
    .join(', ');
  return getDb()
    .prepare(
      `INSERT INTO ${table} (${names.join(', ')}) VALUES (${names.map(() => '?').join(', ')}) ` +
        `ON CONFLICT(id) DO UPDATE SET ${updates}`
    )
    .bind(...values);
}

export async function putDoc(
  table: DocTable,
  id: string,
  columns: Record<string, ColumnValue>,
  data: unknown
): Promise<void> {
  await upsertStatement(table, id, columns, data).run();
}

/** Deletes rows whose id (or any of the extra columns) matches one of `keys`. Returns rows removed. */
export async function deleteDocs(table: DocTable, keys: string[], alsoMatch: string[] = []): Promise<number> {
  if (keys.length === 0) return 0;
  const placeholders = keys.map(() => '?').join(', ');
  const where = ['id', ...alsoMatch].map((c) => `${c} IN (${placeholders})`).join(' OR ');
  const params = ['id', ...alsoMatch].flatMap(() => keys);
  const res = await getDb().prepare(`DELETE FROM ${table} WHERE ${where}`).bind(...params).run();
  return res.meta.changes ?? 0;
}
