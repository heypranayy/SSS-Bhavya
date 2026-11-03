# Bhavya Fashions — B2B Wholesale Catalog Platform

A complete, production-oriented B2B wholesale fashion catalog and lookbook engine for **BhavyaFashions.com**, a premier wholesale manufacturer and supplier of Indian kurtis serving boutiques, apparel retailers, and fashion resellers across India.

> **Strict B2B wholesale architecture**: Strictly **NO** consumer checkout, **NO** payment gateways, **NO** shopping cart purchasing. The platform enables wholesale suppliers to showcase ethnic collections, generate personalized digital lookbooks, collect ratio-packed wholesale requirements, and process wholesale inquiries.

---

## 🌟 Key Capabilities

### 1. Universal Dynamic Catalog Engine (`/admin/catalogs/create`)
- **Mode 1: Dynamic Filter-Based**: Administrators define structured rules (`category`, `price range`, `fabric`, `silhouette style`, `stock status`, `MOQ`) combined via `AND`/`OR` logic. Resolves matching products server-side with zero unnecessary database transfers.
- **Mode 2: Curated Manual**: Hand-pick individual designs, bulk-select whole collections, pin featured hero pieces, and add presentation notes.
- **Mode 3: Hybrid (Recommended)**: Applies deterministic precedence rules:
  1. Base pool matching dynamic rules
  2. Manual product exclusions
  3. Manual product inclusions
  4. Pinned products surfaced at the top of the lookbook
- **Dynamic vs Fixed Membership**: Configure whether newly added warehouse inventory automatically populates the customer's lookbook or remains a frozen snapshot.
- **Customer Price-Tier Engine**: Links lookbooks directly to B2B customer accounts (e.g., Tier Gold with 5% wholesale discount). Calculates quotes deterministically on the server to prevent client-side price tampering.
- **Full Customization**: Configure branding, customer greeting, layout (grid/list), mobile/desktop column counts, price/MOQ visibility, and ratio packing options.
- **Live Mobile Lookbook Preview**: Preview exactly what the boutique owner will see on mobile before publishing.

### 2. Customer-Facing Digital Lookbook (`/catalog/[token]`)
- **Mobile-First Experience**: High-resolution zoomable image lightbox, touch-friendly image carousels, and design specifications.
- **Interactive Ratio Packing**: Enter quantities by size (`M`, `L`, `XL`, `XXL`, `3XL`) with real-time validation against Minimum Order Quantity (MOQ: 6 pcs).
- **Floating Selected Designs Drawer**: Summarizes selected designs, total pieces, and indicative wholesale quote in INR.
- **Anti-Abuse Wholesale Inquiry Submission**: Submits requirement directly to `/api/inquiries`. Generates an official reference code (`BF-INQ-XXXXX`) and provides a 1-tap WhatsApp dispatch connect CTA.
- **Lifecycle Management**: Graceful handling and clear explanations for expired or revoked links.

### 3. Mobile-First Administration Portal (`/admin`)
- **Operations Dashboard**: Live metrics tracking Active Products, Active Catalogs, Total Views, and Inquiries pipeline.
- **Catalog Management (`/admin/catalogs`)**: 1-tap link copying, direct WhatsApp sharing with pre-formatted message, view count analytics, expiry extension, and access revocation.
- **Product Inventory (`/admin/products`)**: Multi-filter search, CSV import/export, and gallery editor with primary image selection.
- **Wholesale Inquiries Desk (`/admin/inquiries`)**: Pipeline workflow (`New` ➔ `Contacted` ➔ `Follow-up` ➔ `Closed`), itemized size ratio breakdown, internal sales notes, and direct WhatsApp follow-up link.
- **B2B Customer Directory (`/admin/customers`)**: Retailer database with custom price tier assignments.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 with custom luxury Indian ethnic theme tokens (`Warm Ivory`, `Muted Wine Burgundy`, `Gold`, `Deep Charcoal`)
- **Icons**: Lucide Icons
- **Hosting**: Cloudflare Workers via [vinext](https://github.com/cloudflare/vinext)
- **Database & Storage**: Cloudflare D1 (SQL) + Cloudflare R2 (product images)
- **Validation**: Zod + React Hook Form
- **Testing**: Vitest automated test suite

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd "BHAVYA FASHIONS"
npm install
```

### 2. Local Database
```bash
npm run db:migrate:local
node scripts/import-to-cloudflare.ts --target local   # needs a Firestore dump; see docs/cloudflare-migration.md
```
Data lives in Cloudflare D1 and images in R2. Locally, Wrangler keeps both in `.wrangler/state`. No database credentials or `.env` secrets are needed.

### 3. Run Automated Tests
```bash
npm test
```
Each test file runs against its own in-memory D1 database loaded with the seed data. Tests never touch real data.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 🚢 Deployment (Cloudflare Workers)

Live at https://bhavya-fashions.tech-gexart.workers.dev (Cloudflare account tech.gexart@gmail.com). Every push to `main` is built and deployed by Cloudflare Workers Builds (build command `npm run build`, deploy command `npm run deploy`). To deploy by hand:
```bash
npm run db:migrate:remote
npm run build
npm run deploy
```
See [docs/cloudflare-migration.md](docs/cloudflare-migration.md) for the D1/R2 setup and the Firebase import.

---

## 🔐 Administrative Access

- **Admin Login Route**: `/admin/login`
- **Dashboard**: `/admin`
- **Catalog Builder**: `/admin/catalogs/create`
- **Inquiry Processing Desk**: `/admin/inquiries`
- **Accounts**: staff sign in with their email and a password stored as a PBKDF2 hash in D1, and stay signed in through an HttpOnly session cookie. Admins manage accounts under **Staff & Roles**.

---

## 📄 License & Commercial Rights
Proprietary software developed for **Bhavya Fashions** (`BhavyaFashions.com`). Strictly for wholesale commercial operations.
