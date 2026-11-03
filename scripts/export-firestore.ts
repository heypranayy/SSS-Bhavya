/**
 * Dumps every Firestore collection of the Bhavya Fashions Firebase project
 * (plus any Firebase Storage files referenced by those documents) to a local
 * folder, ready for scripts/import-to-cloudflare.ts.
 *
 * Usage (Node 22.6+ runs .ts directly):
 *   node scripts/export-firestore.ts --service-account D:\secrets\bhavya-firebase.json
 *   node scripts/export-firestore.ts --api-key <web api key> --project sss-bhavya
 *
 * Options:
 *   --service-account <path>  Firebase service-account JSON key (preferred). Never commit it.
 *   --api-key <key>           Public web API key; only works while Firestore rules allow reads.
 *   --project <id>            Project id (defaults to the one in the service account, else sss-bhavya).
 *   --out <dir>               Output folder (default: migration-data, which is gitignored).
 *
 * Output:
 *   <out>/firestore/<collection>.json   array of { id, ...fields }
 *   <out>/storage/<object path>         downloaded Storage files
 *   <out>/manifest.json                 counts per collection + storage URL -> local file map
 */
import { createSign, createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const COLLECTIONS = [
  'products',
  'catalogs',
  'collections',
  'categories',
  'customers',
  'inquiries',
  'blogs',
  'staff',
  'support_tickets',
  'system_metadata',
] as const;

type Args = { serviceAccount?: string; apiKey?: string; project?: string; out: string };

function parseArgs(argv: string[]): Args {
  const args: Args = { out: 'migration-data' };
  for (let i = 0; i < argv.length; i++) {
    const next = () => argv[++i];
    switch (argv[i]) {
      case '--service-account': args.serviceAccount = next(); break;
      case '--api-key': args.apiKey = next(); break;
      case '--project': args.project = next(); break;
      case '--out': args.out = next(); break;
    }
  }
  return args;
}

async function getAccessToken(keyPath: string): Promise<{ token: string; projectId: string }> {
  const key = JSON.parse(await readFile(keyPath, 'utf-8'));
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/devstorage.read_only',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(key.private_key, 'base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`,
    }),
  });
  if (!res.ok) throw new Error(`Service-account token exchange failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { access_token: string };
  return { token: json.access_token, projectId: key.project_id };
}

/** Converts a Firestore REST `Value` into plain JSON. */
export function decodeValue(v: any): any {
  if (v == null) return null;
  if ('nullValue' in v) return null;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('stringValue' in v) return v.stringValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('bytesValue' in v) return v.bytesValue;
  if ('referenceValue' in v) return v.referenceValue;
  if ('geoPointValue' in v) return v.geoPointValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in v) return decodeFields(v.mapValue.fields || {});
  return null;
}

export function decodeFields(fields: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, val] of Object.entries(fields)) out[k] = decodeValue(val);
  return out;
}

const STORAGE_URL_RE =
  /https:\/\/(?:firebasestorage\.googleapis\.com\/v0\/b\/[^/"'\s]+\/o\/[^"'\s)]+|storage\.googleapis\.com\/[^/"'\s]+\.(?:appspot\.com|firebasestorage\.app)\/[^"'\s)]+|[a-z0-9-]+\.firebasestorage\.app\/[^"'\s)]+)/g;

/** Maps a Storage download URL to its object path inside the bucket. */
export function storageObjectPath(url: string): string {
  const u = new URL(url);
  if (u.hostname === 'firebasestorage.googleapis.com') {
    const m = u.pathname.match(/\/v0\/b\/[^/]+\/o\/(.+)$/);
    if (m) return decodeURIComponent(m[1]);
  }
  const parts = u.pathname.split('/').filter(Boolean);
  if (u.hostname === 'storage.googleapis.com') parts.shift(); // bucket name
  return decodeURIComponent(parts.join('/'));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let authHeader: Record<string, string> = {};
  let keyParam = '';
  let projectId = args.project || 'sss-bhavya';

  if (args.serviceAccount) {
    const { token, projectId: pid } = await getAccessToken(args.serviceAccount);
    authHeader = { authorization: `Bearer ${token}` };
    projectId = args.project || pid;
    console.log(`Authenticated with service account for project ${projectId}`);
  } else if (args.apiKey) {
    keyParam = `key=${encodeURIComponent(args.apiKey)}`;
    console.log(`Using public web API key for project ${projectId} (works only while Firestore rules allow reads)`);
  } else {
    throw new Error('Pass --service-account <path> or --api-key <key>');
  }

  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
  await mkdir(path.join(args.out, 'firestore'), { recursive: true });

  const counts: Record<string, number> = {};
  const storageUrls = new Set<string>();

  for (const name of COLLECTIONS) {
    const docs: Record<string, any>[] = [];
    let pageToken = '';
    do {
      const qs = [`pageSize=300`, keyParam, pageToken && `pageToken=${encodeURIComponent(pageToken)}`]
        .filter(Boolean)
        .join('&');
      const res = await fetch(`${base}/${name}?${qs}`, { headers: authHeader });
      if (!res.ok) throw new Error(`Reading ${name} failed: ${res.status} ${await res.text()}`);
      const json = (await res.json()) as { documents?: any[]; nextPageToken?: string };
      for (const d of json.documents || []) {
        const id = d.name.split('/').pop();
        docs.push({ ...decodeFields(d.fields || {}), __doc_id: id, __create_time: d.createTime, __update_time: d.updateTime });
      }
      pageToken = json.nextPageToken || '';
    } while (pageToken);

    counts[name] = docs.length;
    for (const m of JSON.stringify(docs).matchAll(STORAGE_URL_RE)) storageUrls.add(m[0].replace(/\\u0026/g, '&'));
    await writeFile(path.join(args.out, 'firestore', `${name}.json`), JSON.stringify(docs, null, 2));
    console.log(`  ${name.padEnd(16)} ${docs.length} documents`);
  }

  const storage: Record<string, { file: string; contentType: string; sha256: string }> = {};
  const failed: string[] = [];
  for (const url of storageUrls) {
    try {
      const res = await fetch(url, { headers: url.includes('token=') ? {} : authHeader });
      if (!res.ok) throw new Error(String(res.status));
      const buf = Buffer.from(await res.arrayBuffer());
      const objectPath = storageObjectPath(url);
      const file = path.join('storage', objectPath);
      await mkdir(path.dirname(path.join(args.out, file)), { recursive: true });
      await writeFile(path.join(args.out, file), buf);
      storage[url] = {
        file: file.split(path.sep).join('/'),
        contentType: res.headers.get('content-type') || 'application/octet-stream',
        sha256: createHash('sha256').update(buf).digest('hex'),
      };
    } catch (err) {
      failed.push(`${url} (${(err as Error).message})`);
    }
  }
  console.log(`  storage files    ${Object.keys(storage).length} downloaded, ${failed.length} failed`);
  failed.forEach((f) => console.warn(`    failed: ${f}`));

  await writeFile(
    path.join(args.out, 'manifest.json'),
    JSON.stringify({ projectId, exportedAt: new Date().toISOString(), counts, storage, failedStorage: failed }, null, 2)
  );
  console.log(`Export written to ${args.out}/`);
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` || process.argv[1]?.endsWith('export-firestore.ts')) {
  main().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });
}
