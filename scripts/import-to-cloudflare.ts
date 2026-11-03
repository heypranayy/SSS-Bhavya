/**
 * Loads a Firestore dump (from scripts/export-firestore.ts) into Cloudflare D1,
 * and the images into R2, then checks the row counts.
 *
 * Usage (Node 22.6+ runs .ts directly):
 *   node scripts/import-to-cloudflare.ts --target local     # Wrangler's local D1/R2 (.wrangler/state)
 *   node scripts/import-to-cloudflare.ts --target remote    # the real Cloudflare resources
 *
 * Options:
 *   --data <dir>     Dump folder (default: migration-data)
 *   --skip-r2        Rewrite image URLs but do not upload files (they must already be in R2)
 *   --dry-run        Build migration-data/import.sql and the image list, change nothing
 *
 * What D1 receives is exactly what the live Firebase site displayed: the Firestore
 * documents merged with the seed data and committed JSON files the old repositories
 * merged in at runtime, minus records those repositories had tombstoned.
 *
 * Images: base64 `data:` images embedded in documents and Firebase Storage files are
 * uploaded to R2 and rewritten to /media/<key>. Links to the defunct WordPress site
 * are pointed at the local copies in public/images/products. Paths under /images
 * and /uploads stay static assets.
 *
 * Staff: every admin account gets a fresh random password (the old ones are in the
 * public git history). New credentials are written to <data>/staff-credentials.txt;
 * accounts that already exist in D1 keep their password on re-runs.
 */
import { createHash, randomBytes } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  SEED_CATALOGS,
  SEED_CATEGORIES,
  SEED_COLLECTIONS,
  SEED_CUSTOMERS,
  SEED_INQUIRIES,
  SEED_PRODUCTS,
  SEED_TICKETS,
} from '../src/lib/data/seed-data.ts';
import { COLUMNS_FOR } from '../src/lib/db/rows.ts';
import { hashPassword } from '../src/lib/auth/password.ts';

const DB_NAME = 'bhavya-fashions-db';
const BUCKET = 'bhavya-fashions-media';
const LEGACY_IMAGE_HOSTS = ['bhavyafashions.com', 'www.bhavyafashions.com'];

type Doc = Record<string, any> & { id: string };
type Target = 'local' | 'remote';

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const opt = (name: string, fallback: string) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const target = opt('--target', 'local') as Target;
const dataDir = opt('--data', 'migration-data');
const dryRun = flag('--dry-run');
const skipR2 = flag('--skip-r2');
if (target !== 'local' && target !== 'remote') throw new Error('--target must be local or remote');
const R2_CONCURRENCY = target === 'remote' ? 6 : 1; // local R2 is a single SQLite file

const wranglerBin = path.join('node_modules', 'wrangler', 'bin', 'wrangler.js');
function wrangler(argv: string[]): string {
  return execFileSync(process.execPath, [wranglerBin, ...argv], { encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 });
}
function d1Json(sql: string): any[] {
  const out = wrangler(['d1', 'execute', DB_NAME, `--${target}`, '--json', '--command', sql]);
  return JSON.parse(out.slice(out.indexOf('[')))[0].results;
}

// ---------------------------------------------------------------- load dump

function readJson<T>(file: string, fallback: T): T {
  if (!existsSync(file)) return fallback;
  const text = readFileSync(file, 'utf-8');
  return text.trim() ? (JSON.parse(text) as T) : fallback;
}

function firestore(name: string): Doc[] {
  const file = path.join(dataDir, 'firestore', `${name}.json`);
  if (!existsSync(file)) throw new Error(`Missing ${file}. Run scripts/export-firestore.ts first.`);
  return readJson<any[]>(file, []).map(({ __doc_id, __create_time, __update_time, ...rest }) => ({
    ...rest,
    id: rest.id || __doc_id,
  }));
}

// Files the old repositories merged in at runtime (kept only for this import).
const local = (name: string) =>
  readJson<any[]>(path.join(name.startsWith('migrated-') ? 'src/lib/data' : 'scripts/legacy-data', `${name}.json`), []);
const manifest = readJson<any>(path.join(dataDir, 'manifest.json'), { counts: {}, storage: {} });

/** Later sources win, like the old repositories' Map merges. */
function merge(...sources: Doc[][]): Map<string, Doc> {
  const map = new Map<string, Doc>();
  for (const list of sources) for (const d of list) if (d?.id) map.set(d.id, d);
  return map;
}

// --------------------------------------------- reproduce the live merge rules

const fsDocs = Object.fromEntries(
  ['products', 'catalogs', 'collections', 'categories', 'customers', 'inquiries', 'blogs', 'staff', 'support_tickets', 'system_metadata'].map(
    (n) => [n, firestore(n)]
  )
) as Record<string, Doc[]>;

const report: Array<{ table: string; firestore: number | string; added: number; dropped: number; expected: number }> = [];

// products: seed + custom JSON + Firestore, minus tombstoned ids/codes and is_deleted/is_active=false
const deletedProducts = new Set<string>([
  ...local('deleted-products'),
  ...(fsDocs.system_metadata.find((d) => d.id === 'deleted_products')?.ids || []),
]);
const productHidden = (p: Doc) =>
  p.is_deleted === true || p.is_active === false || deletedProducts.has(p.id) || (p.code && deletedProducts.has(p.code));
const productsAll = merge(SEED_PRODUCTS as Doc[], local('custom-products'), fsDocs.products);
const products = [...productsAll.values()].filter((p) => !productHidden(p));

// categories: Firestore, falling back to seed
const categories = fsDocs.categories.length ? fsDocs.categories : (SEED_CATEGORIES as Doc[]);

// collections / catalogs: seed + JSON + Firestore, minus tombstones
const deletedCollections = new Set<string>(local('deleted-collections'));
const collections = [...merge(SEED_COLLECTIONS as Doc[], local('custom-collections'), fsDocs.collections).values()].filter(
  (c) => !deletedCollections.has(c.id) && !deletedCollections.has(c.slug)
);
const deletedCatalogs = new Set<string>(local('deleted-catalogs'));
const catalogs = [...merge(SEED_CATALOGS as Doc[], local('custom-catalogs'), fsDocs.catalogs).values()].filter(
  (c) => !deletedCatalogs.has(c.id) && !deletedCatalogs.has(c.public_token)
);

// customers and tickets: the old code returned the Firestore list alone whenever it was non-empty
const customers = fsDocs.customers.length ? fsDocs.customers : [...merge(SEED_CUSTOMERS as Doc[], local('custom-customers')).values()];
const tickets = fsDocs.support_tickets.length ? fsDocs.support_tickets : [...merge(SEED_TICKETS as Doc[], local('support-tickets')).values()];

// blogs and inquiries: always shown merged with the built-in lists
const blogs = [...merge(local('migrated-blogs'), local('custom-blogs'), fsDocs.blogs).values()];
const inquiries = [...merge(SEED_INQUIRIES as Doc[], fsDocs.inquiries).values()];

function note(table: string, fsList: Doc[], final: Doc[]) {
  const fsIds = new Set(fsList.map((d) => d.id));
  const finalIds = new Set(final.map((d) => d.id));
  report.push({
    table,
    firestore: fsList.length,
    added: final.filter((d) => !fsIds.has(d.id)).length,
    dropped: fsList.filter((d) => !finalIds.has(d.id)).length,
    expected: final.length,
  });
}
note('products', fsDocs.products, products);
note('categories', fsDocs.categories, categories);
note('collections', fsDocs.collections, collections);
note('catalogs', fsDocs.catalogs, catalogs);
note('customers', fsDocs.customers, customers);
note('inquiries', fsDocs.inquiries, inquiries);
note('blogs', fsDocs.blogs, blogs);
note('support_tickets', fsDocs.support_tickets, tickets);

// ------------------------------------------------------------- images -> R2

type Upload = { key: string; file: string; contentType: string };
const uploads = new Map<string, Upload>();
const cacheDir = path.join(dataDir, 'r2');
mkdirSync(cacheDir, { recursive: true });

const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg', 'image/avif': 'avif' };
const safeKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9._/-]+/g, '-').replace(/-+/g, '-');

function addUpload(key: string, bytes: Buffer, contentType: string): string {
  const file = path.join(cacheDir, key.replace(/\//g, '__'));
  if (!uploads.has(key)) {
    writeFileSync(file, bytes);
    uploads.set(key, { key, file, contentType });
  }
  return `/media/${key}`;
}

// The old WordPress site is gone (bhavyafashions.com now serves this app), but the
// migration from it saved copies under public/images/products as images[].local_url.
const legacyLocal = new Map<string, string>();
for (const p of [...(SEED_PRODUCTS as Doc[]), ...fsDocs.products]) {
  for (const im of p.images || []) {
    if (im?.image_url && im.local_url && existsSync(path.join('public', im.local_url))) legacyLocal.set(im.image_url, im.local_url);
  }
}
const unresolvedLegacy = new Set<string>();

const imageStats = { dataUrls: 0, legacy: 0, storage: 0 };
async function rewriteImages(value: any): Promise<any> {
  if (typeof value === 'string') {
    const data = value.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
    if (data) {
      const bytes = Buffer.from(data[2], 'base64');
      const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 24);
      imageStats.dataUrls++;
      return addUpload(`migrated/inline/${hash}.${EXT[data[1].toLowerCase()] || 'bin'}`, bytes, data[1].toLowerCase());
    }
    const stored = manifest.storage?.[value];
    if (stored) {
      imageStats.storage++;
      return addUpload(safeKey(`migrated/firebase/${stored.file.replace(/^storage\//, '')}`), readFileSync(path.join(dataDir, stored.file)), stored.contentType);
    }
    if (/^https?:\/\//.test(value)) {
      try {
        const u = new URL(value);
        if (LEGACY_IMAGE_HOSTS.includes(u.hostname) && /\.(jpe?g|png|webp|gif|avif)$/i.test(u.pathname)) {
          const localCopy = legacyLocal.get(value);
          if (localCopy) {
            imageStats.legacy++;
            return localCopy;
          }
          unresolvedLegacy.add(value);
        }
      } catch {}
    }
    return value;
  }
  if (Array.isArray(value)) return Promise.all(value.map(rewriteImages));
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) if (v !== undefined) out[k] = await rewriteImages(v);
    return out;
  }
  return value;
}

// ------------------------------------------------------------------ staff

type StaffSeed = { id: string; name: string; email: string; role: string; hub: string; status?: string; created_at?: string };
const staffSeeds: StaffSeed[] = [
  ...fsDocs.staff.map((s) => ({ id: s.id, name: s.name, email: s.email, role: s.role, hub: s.hub, status: s.status, created_at: s.created_at })),
  // The accounts the old code accepted through hard-coded master passwords.
  { id: 'staff-super-1', name: 'Super Administrator', email: 'sss@bhavyafashions.com', role: 'super_admin', hub: 'All Hubs' },
  { id: 'staff-admin-2', name: 'System Admin', email: 'admin@bhavyafashions.com', role: 'admin', hub: 'All Hubs' },
  { id: 'staff-lead-pranay', name: 'Pranay (Gexart Lead)', email: 'pranay@gexart.com', role: 'super_admin', hub: 'All Hubs' },
];

// ------------------------------------------------------------------- SQL

const sqlString = (v: unknown) => (v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);

function insertSql(table: string, doc: Doc): string {
  const columns = COLUMNS_FOR[table as keyof typeof COLUMNS_FOR]!(doc);
  const names = ['id', ...Object.keys(columns), 'data'];
  const values = [doc.id, ...Object.values(columns), JSON.stringify(doc)].map(sqlString);
  return `INSERT INTO ${table} (${names.join(', ')}) VALUES (${values.join(', ')});`;
}

async function main() {
  console.log(`Importing ${dataDir}/ into ${target} D1 "${DB_NAME}" and R2 "${BUCKET}"${dryRun ? ' (dry run)' : ''}`);

  const tables: Array<[string, Doc[]]> = [
    ['products', products],
    ['categories', categories],
    ['collections', collections],
    ['catalogs', catalogs],
    ['customers', customers],
    ['inquiries', inquiries],
    ['blogs', blogs],
    ['support_tickets', tickets],
  ];

  const statements: string[] = [];
  for (const [table, docs] of tables) {
    statements.push(`DELETE FROM ${table};`);
    for (const doc of docs) statements.push(insertSql(table, await rewriteImages(doc)));
  }

  // site settings (Firestore system_metadata/site_settings, if it was ever saved)
  const siteSettings = fsDocs.system_metadata.find((d) => d.id === 'site_settings');
  if (siteSettings) {
    const { id: _id, ...value } = siteSettings;
    statements.push(
      `INSERT INTO settings (key, value, updated_at) VALUES ('site_settings', ${sqlString(JSON.stringify(value))}, ${sqlString(new Date().toISOString())}) ` +
        `ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;`
    );
  }

  // staff: create only the accounts that do not exist yet
  let existingEmails = new Set<string>();
  if (!dryRun) {
    try {
      existingEmails = new Set(d1Json('SELECT email FROM staff').map((r) => String(r.email).toLowerCase()));
    } catch (err) {
      throw new Error(`Could not read the staff table. Apply migrations first:\n  npx wrangler d1 migrations apply ${DB_NAME} --${target}\n${(err as Error).message}`);
    }
  }
  const newCredentials: string[] = [];
  const now = new Date().toISOString();
  for (const s of staffSeeds) {
    const email = s.email.trim().toLowerCase();
    if (existingEmails.has(email)) continue;
    existingEmails.add(email);
    const password = randomBytes(12).toString('base64url');
    const account = { id: s.id, name: s.name, email, role: s.role, hub: s.hub, status: s.status || 'active', lastActive: 'Never', created_at: s.created_at || now, updated_at: now };
    statements.push(
      `INSERT INTO staff (id, email, password_hash, role, status, created_at, updated_at, data) VALUES (` +
        [account.id, email, await hashPassword(password), account.role, account.status, account.created_at, now, JSON.stringify(account)].map(sqlString).join(', ') +
        `) ON CONFLICT DO NOTHING;`
    );
    newCredentials.push(`${email}\t${password}\t(${account.role})`);
  }

  const oversized = statements.filter((s) => s.length > 100_000);
  if (oversized.length) throw new Error(`${oversized.length} SQL statements exceed D1's 100 KB limit`);

  const sqlFile = path.join(dataDir, `import-${target}.sql`);
  writeFileSync(sqlFile, statements.join('\n') + '\n');
  console.log(`  SQL written to ${sqlFile} (${statements.length} statements)`);
  console.log(`  images: ${imageStats.dataUrls} inline data URLs, ${imageStats.storage} Firebase Storage files, ${imageStats.legacy} old-site links -> local copies; ${uploads.size} R2 objects`);
  if (unresolvedLegacy.size) console.warn(`  ! ${unresolvedLegacy.size} old-site image link(s) have no local copy and were left as is:\n    ${[...unresolvedLegacy].join('\n    ')}`);

  if (dryRun) {
    console.table(report);
    return;
  }

  // R2 first, so no row ever points at a missing image
  if (!skipR2 && uploads.size) {
    let done = 0;
    const failed: string[] = [];
    const queue = [...uploads.values()];
    const worker = async () => {
      for (let u = queue.shift(); u; u = queue.shift()) {
        const item = u;
        let ok = false;
        for (let attempt = 0; attempt < 3 && !ok; attempt++) {
          ok = await new Promise<boolean>((resolve) => {
          const child = spawn(process.execPath, [wranglerBin, 'r2', 'object', 'put', `${BUCKET}/${item.key}`, '--file', item.file, '--content-type', item.contentType, '--cache-control', 'public, max-age=31536000, immutable', `--${target}`], { stdio: 'ignore' });
          child.on('close', (code) => resolve(code === 0));
          });
        }
        if (ok) done++;
        else failed.push(item.key);
      }
    };
    await Promise.all(Array.from({ length: R2_CONCURRENCY }, worker));
    console.log(`  R2: ${done}/${uploads.size} objects uploaded`);
    if (failed.length) throw new Error(`R2 upload failed for: ${failed.join(', ')}`);
  }

  wrangler(['d1', 'execute', DB_NAME, `--${target}`, '--file', sqlFile, '--yes']);
  console.log('  D1: import applied');

  if (newCredentials.length) {
    const credFile = path.join(dataDir, 'staff-credentials.txt');
    writeFileSync(credFile, `# Admin logins created ${now} (${target}). Share each privately, then delete this file.\n${newCredentials.join('\n')}\n`, { flag: 'a' });
    console.log(`  staff: ${newCredentials.length} new account(s); passwords written to ${credFile}`);
  }

  // verify counts
  // One row of scalar subqueries; D1 rejects long UNION ALL chains.
  const actual: Record<string, number> = d1Json(
    'SELECT ' + [...tables.map(([t]) => t), 'staff'].map((t) => `(SELECT COUNT(*) FROM ${t}) AS ${t}`).join(', ')
  )[0];
  const rows = report.map((r) => ({ ...r, d1: actual[r.table], ok: actual[r.table] === r.expected ? '✓' : '✗ MISMATCH' }));
  rows.push({ table: 'staff', firestore: fsDocs.staff.length, added: staffSeeds.length - fsDocs.staff.length, dropped: 0, expected: existingEmails.size, d1: actual.staff, ok: actual.staff >= existingEmails.size ? '✓' : '✗ MISMATCH' });
  console.table(rows);
  if (rows.some((r) => r.ok !== '✓')) {
    process.exitCode = 1;
    console.error('Row counts do not match the export.');
  } else {
    console.log('All row counts match.');
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
