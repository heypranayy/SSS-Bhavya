# Firebase → Cloudflare migration

The Bhavya Fashions B2B site moved from Next.js on Vercel with Firestore, Firebase
Storage and hard-coded admin passwords to **Cloudflare Workers + D1 + R2** with its own
login. There is no Firebase or Supabase code or dependency left.

| Before | After |
| --- | --- |
| `next build` on Vercel | [vinext](https://github.com/cloudflare/vinext) (`vite build`) on Cloudflare Workers, worker `bhavya-fashions` |
| 9 Firestore collections + `system_metadata`, merged at runtime with seed data and `src/lib/data/*.json` | D1 database `bhavya-fashions-db` (`migrations/0001_init.sql`) as the only source of truth |
| JSON files written with `fs` (never worked on serverless) | removed; the few real records were folded into the import |
| Base64 images stored inside Firestore documents | R2 bucket `bhavya-fashions-media`, served by the Worker at `/media/<key>` |
| `/api/upload` → local disk / Firebase Storage | `/api/upload` → R2 (`uploads/…`) |
| Firebase Auth + client-side password checks + `localStorage` flag | `staff` table with PBKDF2-SHA256 hashes, `sessions` table, HttpOnly `bhavya_session` cookie, `src/proxy.ts` guard |

## Schema

Each former collection is a table with the full record as JSON in `data`, plus indexed
columns for what the app filters and sorts on (`code`, `slug`, `public_token`,
`created_at`, …). Column extraction lives in `src/lib/db/rows.ts` and is shared by
the repositories, the import script and the test database. New schema changes go
in a new file under `migrations/`, then:

```bash
npm run db:migrate:local
npm run db:migrate:remote
```

## Cloudflare account

Everything lives on the **tech.gexart@gmail.com** Cloudflare account
(`8af4b0b1475268d847835db412045fde`), which is pinned as `account_id` in `wrangler.jsonc`.
On the Gexart dev machine, Wrangler's login for this account is kept apart from the
default login, which another project uses, in `C:\Users\USER\.wrangler-profiles\tech-gexart`.
Prefix remote commands with it:

```bash
XDG_CONFIG_HOME="C:\\Users\\USER\\.wrangler-profiles\\tech-gexart" npx wrangler whoami
```

## Bindings, env and secrets

All in `wrangler.jsonc`:

| Binding | Resource |
| --- | --- |
| `DB` | D1 `bhavya-fashions-db` (id `b04e8c76-79c4-4f0f-abec-38466e76a10b`) |
| `BUCKET` | R2 `bhavya-fashions-media` |
| `ASSETS` | static files from `public/` |

**No secrets are required.** Passwords are hashed in D1 and sessions are random tokens
(only their SHA-256 is stored), so there is no signing key to manage. The
`NEXT_PUBLIC_*` values in `.env.example` are optional public build-time settings.
Workers Builds (the GitHub integration) supplies its own API token. To deploy from
another CI, set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

## Admin login

- `POST /api/admin/login` checks the hash and sets the session cookie (7 days, HttpOnly, SameSite=Lax, Secure on https).
- `POST /api/admin/logout` deletes the session. `GET /api/admin/me` returns the signed-in user.
- `src/proxy.ts` (rules in `src/lib/auth/access.ts`) redirects signed-out visitors away from `/admin/*`, and returns 401 for every API except the buyer-facing ones: `GET /api/blogs`, `GET /api/collections`, `POST /api/inquiries`, `POST /api/catalog/verify-code` and `POST /api/catalogs/filter-count`.
- Only `super_admin` and `admin` can create, edit or delete staff. Changing a password or suspending an account ends that person's sessions.

The old master passwords (`Bhavya@2026`, `bhavya2026admin`, `Gexart@2026`, …) were in this
**public** repository's history, so none of them work any more. The import created these
accounts with fresh random passwords:

- `sss@bhavyafashions.com`
- `admin@bhavyafashions.com`
- `pranay@gexart.com`
- `bhavyafashionsbysss@gmail.com` (the one staff document in Firestore)

The passwords are in `migration-data/staff-credentials.txt` (gitignored). Hand each one
over privately, have people change their own passwords under **Staff & Roles**, then
delete the file.

## Re-running the export and import

1. **Export Firestore** to `migration-data/` (gitignored, since it contains customer data):

   ```bash
   # preferred: a service-account key from Firebase console → Project settings → Service accounts
   node scripts/export-firestore.ts --service-account D:\secrets\bhavya-firebase.json
   # or, while the Firestore rules still allow public reads:
   node scripts/export-firestore.ts --api-key <web api key> --project sss-bhavya
   ```

   Keep the key outside the repo. `*service-account*.json` and `*firebase-adminsdk*.json` are gitignored anyway.

2. **Import** (first local, then remote):

   ```bash
   npm run db:migrate:local
   node scripts/import-to-cloudflare.ts --target local --dry-run   # preview counts and the SQL file
   node scripts/import-to-cloudflare.ts --target local
   npm run db:migrate:remote
   node scripts/import-to-cloudflare.ts --target remote
   ```

   The import replaces every content table, uploads images to R2 before writing rows,
   leaves existing staff accounts and passwords alone, and finishes with a row-count check
   that exits non-zero on any mismatch.

### What the import contains

D1 gets exactly what the live Firebase site displayed. The old repositories merged Firestore
with seed data and committed JSON files at runtime, and hid tombstoned ids. The import
applies the same rules once. The leftover JSON files it reads are in `scripts/legacy-data/`.

| table | Firestore | added from seed/JSON | dropped (tombstoned) | D1 |
| --- | --- | --- | --- | --- |
| products | 76 | 2 | 3 | 75 |
| categories | 9 | 0 | 0 | 9 |
| collections | 4 | 2 | 0 | 6 |
| catalogs | 9 | 1 | 0 | 10 |
| customers | 27 | 0 | 0 | 27 |
| inquiries | 31 | 3 (sample inquiries) | 0 | 34 |
| blogs | 24 | 25 (3 old-site posts + test copies) | 0 | 49 |
| support_tickets | 9 | 0 | 0 | 9 |
| staff | 1 | 3 (former master accounts) | 0 | 4 |

Images: 132 base64 images embedded in documents became 121 R2 objects (duplicates share a
key). Firestore held no Firebase Storage URLs. 10 links to the defunct WordPress site
now point at the copies already in `public/images/products/`. Two links in the sample
inquiries have no surviving copy and were left as they were.

### Test data

The old test suite wrote to the live Firestore, so the data still contains test records:
about 24 "Jaipur Heritage Boutique" customers, about 22 "Top Wholesale Kurti Trends"
blog copies, and several "Exclusive Wholesale Kurti Lookbook 2026" catalogs. They were
imported unchanged so the counts can be checked. Tests now run against an in-memory D1
(`tests/helpers/cloudflare-workers.ts`) and can no longer touch real data.

## After cut-over

- Point `bhavyafashions.com` at the Worker (Workers & Pages → bhavya-fashions → Settings → Domains & Routes) and remove it from Vercel.
- **Lock down or delete the Firebase project `sss-bhavya`.** Its Firestore rules allow anyone with the public web key to read, and very likely write, every collection, including customer phone numbers.
