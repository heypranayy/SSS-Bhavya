-- Bhavya Fashions B2B schema on Cloudflare D1.
--
-- Each former Firestore collection becomes one table. The full record is kept
-- as JSON in `data` (products, catalogs and inquiries are deeply nested), and
-- the fields the app filters, sorts or looks up by are copied into real columns
-- with indexes. Repositories in src/lib/repository/* keep both in sync.

CREATE TABLE products (
  id          TEXT PRIMARY KEY,
  code        TEXT,
  slug        TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  data        TEXT NOT NULL
);
CREATE INDEX idx_products_code ON products (code);
CREATE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_created ON products (created_at DESC);

CREATE TABLE categories (
  id             TEXT PRIMARY KEY,
  slug           TEXT,
  display_order  INTEGER NOT NULL DEFAULT 0,
  data           TEXT NOT NULL
);

CREATE TABLE collections (
  id             TEXT PRIMARY KEY,
  slug           TEXT,
  display_order  INTEGER NOT NULL DEFAULT 0,
  data           TEXT NOT NULL
);
CREATE INDEX idx_collections_slug ON collections (slug);

CREATE TABLE customers (
  id             TEXT PRIMARY KEY,
  business_name  TEXT,
  created_at     TEXT NOT NULL,
  updated_at     TEXT,
  data           TEXT NOT NULL
);

CREATE TABLE catalogs (
  id            TEXT PRIMARY KEY,
  public_token  TEXT NOT NULL UNIQUE,
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  data          TEXT NOT NULL
);

CREATE TABLE inquiries (
  id            TEXT PRIMARY KEY,
  reference_no  TEXT,
  status        TEXT NOT NULL DEFAULT 'new',
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  data          TEXT NOT NULL
);
CREATE INDEX idx_inquiries_reference ON inquiries (reference_no);
CREATE INDEX idx_inquiries_created ON inquiries (created_at DESC);

CREATE TABLE blogs (
  id    TEXT PRIMARY KEY,
  slug  TEXT,
  date  TEXT NOT NULL,
  data  TEXT NOT NULL
);
CREATE INDEX idx_blogs_slug ON blogs (slug);

CREATE TABLE support_tickets (
  id             TEXT PRIMARY KEY,
  ticket_number  TEXT,
  status         TEXT NOT NULL DEFAULT 'open',
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL,
  data           TEXT NOT NULL
);

-- Admin staff. `password_hash` is "pbkdf2-sha256$<iterations>$<salt b64>$<hash b64>".
-- It is never copied into `data`.
CREATE TABLE staff (
  id             TEXT PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash  TEXT,
  role           TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'active',
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL,
  data           TEXT NOT NULL
);

-- Admin login sessions. `id` is the SHA-256 of the cookie token, so a leaked
-- database row cannot be replayed as a cookie.
CREATE TABLE sessions (
  id          TEXT PRIMARY KEY,
  staff_id    TEXT NOT NULL REFERENCES staff (id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL,
  expires_at  TEXT NOT NULL
);
CREATE INDEX idx_sessions_staff ON sessions (staff_id);

-- Key/value app settings (replaces Firestore system_metadata/site_settings).
CREATE TABLE settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
