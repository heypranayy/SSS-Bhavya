# Bhavya Fashions on Cloudflare

The whole site runs on **GitHub + Cloudflare**: code in `heypranayy/SSS-Bhavya`, and the
site, data, images and login on Cloudflare. No other hosting, database or auth service is used.

| Piece | Where |
| --- | --- |
| Site | Cloudflare Worker `bhavya-fashions`, built with [vinext](https://github.com/cloudflare/vinext) (`vite build`) |
| Domains | https://bhavyafashions.com and https://www.bhavyafashions.com (Worker Custom Domains). Backup URL: https://bhavya-fashions.tech-gexart.workers.dev |
| Data | D1 database `bhavya-fashions-db` (schema in `migrations/`) |
| Images | R2 bucket `bhavya-fashions-media`, served by the Worker at `/media/<key>` |
| Admin login | `staff` + `sessions` tables in D1, PBKDF2 password hashes, HttpOnly session cookie |
| Deploys | Cloudflare Workers Builds: every push to `main` runs `npm run build` and then `npm run deploy` |

## Cloudflare account

Everything is on the **tech.gexart@gmail.com** Cloudflare account
(`8af4b0b1475268d847835db412045fde`), which is pinned as `account_id` in `wrangler.jsonc`. The
`bhavyafashions.com` DNS zone is on the same account.

On the Gexart dev machine, Wrangler's login for this account is kept apart from the default
login (another project uses that one), in `C:\Users\USER\.wrangler-profiles\tech-gexart`.
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
Workers Builds supplies its own API token. To deploy from another CI, set
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

## Schema

Each collection of records is a table, with the full record as JSON in `data` plus
indexed columns for what the app filters and sorts on (`code`, `slug`, `public_token`,
`created_at`, …). Column extraction lives in `src/lib/db/rows.ts` and is shared by the
repositories and the test database. Put schema changes in a new file under `migrations/`, then:

```bash
npm run db:migrate:local
npm run db:migrate:remote
```

## Admin login

- `POST /api/admin/login` checks the hash and sets the session cookie (7 days, HttpOnly, SameSite=Lax, Secure on https).
- `POST /api/admin/logout` deletes the session. `GET /api/admin/me` returns the signed-in user.
- `src/proxy.ts` (rules in `src/lib/auth/access.ts`) redirects signed-out visitors away from `/admin/*`, and returns 401 for every API except the buyer-facing ones: `GET /api/blogs`, `GET /api/collections`, `POST /api/inquiries`, `POST /api/catalog/verify-code` and `POST /api/catalogs/filter-count`.
- Only `super_admin` and `admin` can create, edit or delete staff. Changing a password or suspending an account ends that person's sessions.

Admin accounts: `sss@bhavyafashions.com`, `admin@bhavyafashions.com`, `pranay@gexart.com`,
`bhavyafashionsbysss@gmail.com`. Each was given a random password when the data moved to D1,
and people should change their own passwords under **Staff & Roles**.

## Backups and local copies

```bash
# full backup of the production database
npx wrangler d1 export bhavya-fashions-db --remote --output migration-data/backup.sql
# D1 also keeps 30 days of point-in-time history
npx wrangler d1 time-travel info bhavya-fashions-db
```

`migration-data/` is gitignored because exports contain customer data.

## History

Until 2026-11-03 the site ran on Vercel, with Firebase holding the data. On that date all records
and images were copied into D1/R2 and the counts were verified: 76 products, 10 catalogs,
6 collections, 9 categories, 27 customers, 34 inquiries, 49 blogs, 9 tickets, 4 staff and 123
images. The domain then moved to Cloudflare, and the Vercel Git connection was removed. The
one-time copy scripts are in git history (commit `6a89434`).

The old data includes test records the previous test suite wrote to the live database, for
example "Jaipur Heritage Boutique" customers and duplicate "Top Wholesale Kurti Trends" blogs.
Tests now run against an in-memory D1 (`tests/helpers/cloudflare-workers.ts`).
