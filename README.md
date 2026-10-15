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
- **Database & Storage**: Supabase PostgreSQL + Supabase Storage + Row Level Security (RLS)
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

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BRAND_NAME="Bhavya Fashions"
NEXT_PUBLIC_WHATSAPP_NUMBER="919830122334"
NEXT_PUBLIC_SALES_EMAIL="wholesale@bhavyafashions.com"
```

> **Zero-Config Fallback Mode**: The platform includes a fallback repository layer. Even before you connect your live Supabase database, all pages, the catalog builder, customer lookbooks, and inquiry flows work out-of-the-box with authentic Indian wholesale kurti seed data.

### 3. Run Automated Tests
```bash
npm test
```
Runs the 11 unit tests for filter rules, numeric boundaries, hybrid catalog precedence, customer pricing tiers, and inquiry MOQ validation.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Database Setup (Supabase)

1. Open your [Supabase Dashboard](https://supabase.com).
2. Go to the **SQL Editor**.
3. Run the complete schema migration:
   - File: `supabase/migrations/20261015000000_init_bhavya_fashions.sql`
   - Sets up all normalized tables: `profiles`, `categories`, `collections`, `products`, `product_images`, `product_variants`, `customers`, `catalogs`, `catalog_rule_groups`, `catalog_rules`, `catalog_overrides`, `inquiries`, `inquiry_items`, and Row Level Security policies.
4. Run the seed data script:
   - File: `supabase/seed.sql`
   - Populates initial categories (Single Kurtis, 2-Piece Kurti Pant, 3-Piece Muslin Sets, Co-ords, Gowns), 5 curated collections, 8 wholesale products, customers, and active lookbook catalogs.

---

## 🚢 Deployment to Vercel

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete Bhavya Fashions wholesale platform"
   git push origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com) and click **"Add New Project"** ➔ Import repository.
3. Add your Environment Variables in the Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (e.g. `https://bhavyafashions.com`)
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
4. Click **Deploy**.
5. Connect your domain **`BhavyaFashions.com`** in Vercel **Settings ➔ Domains**.

---

## 🔐 Administrative Access

- **Admin Login Route**: `/admin/login`
- **Dashboard**: `/admin`
- **Catalog Builder**: `/admin/catalogs/create`
- **Inquiry Processing Desk**: `/admin/inquiries`
- **Default Credentials** (Development/Demo):
  - Email: `admin@bhavyafashions.com`
  - Password: `bhavya2026admin`

---

## 📄 License & Commercial Rights
Proprietary software developed for **Bhavya Fashions** (`BhavyaFashions.com`). Strictly for wholesale commercial operations.
