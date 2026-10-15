-- ====================================================================
-- BHAVYA FASHIONS — B2B Wholesale Platform Database Schema
-- Supabase PostgreSQL Migration
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES (Admin & Staff)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'staff')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. COLLECTIONS
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    fabric TEXT,
    color TEXT,
    style_type TEXT,
    base_wholesale_price NUMERIC(10, 2) NOT NULL CHECK (base_wholesale_price >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    moq INTEGER NOT NULL DEFAULT 6 CHECK (moq > 0),
    stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'made_to_order', 'out_of_stock')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(code);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(base_wholesale_price);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);

-- 6. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    storage_path TEXT,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);

-- 7. PRODUCT VARIANTS (Sizes & Inventory)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    sku TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 50,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, size)
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);

-- 8. PRODUCT COLLECTIONS (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.product_collections (
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (product_id, collection_id)
);

-- 9. CUSTOMERS (B2B Wholesale Buyers)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    city TEXT,
    state TEXT,
    segment TEXT DEFAULT 'Retailer',
    discount_pct NUMERIC(5, 2) DEFAULT 0 CHECK (discount_pct >= 0 AND discount_pct <= 100),
    custom_price_tier TEXT DEFAULT 'standard',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- 10. CATALOG TEMPLATES
CREATE TABLE IF NOT EXISTS public.catalog_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. CATALOGS
CREATE TABLE IF NOT EXISTS public.catalogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    public_token TEXT NOT NULL UNIQUE,
    mode TEXT NOT NULL DEFAULT 'dynamic' CHECK (mode IN ('dynamic', 'curated', 'hybrid')),
    membership_type TEXT NOT NULL DEFAULT 'dynamic' CHECK (membership_type IN ('dynamic', 'fixed')),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'expired', 'revoked')),
    expires_at TIMESTAMPTZ,
    access_code TEXT,
    customer_greeting TEXT,
    custom_message TEXT,
    presentation_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalogs_token ON public.catalogs(public_token);
CREATE INDEX IF NOT EXISTS idx_catalogs_status ON public.catalogs(status);

-- 12. CATALOG RULE GROUPS & RULES
CREATE TABLE IF NOT EXISTS public.catalog_rule_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catalog_id UUID NOT NULL REFERENCES public.catalogs(id) ON DELETE CASCADE,
    logical_operator TEXT NOT NULL DEFAULT 'AND' CHECK (logical_operator IN ('AND', 'OR')),
    display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.catalog_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.catalog_rule_groups(id) ON DELETE CASCADE,
    attribute TEXT NOT NULL,
    operator TEXT NOT NULL,
    value JSONB NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- 13. CATALOG OVERRIDES (Curated additions/exclusions/pins)
CREATE TABLE IF NOT EXISTS public.catalog_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catalog_id UUID NOT NULL REFERENCES public.catalogs(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('include', 'exclude')),
    display_order INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    presentation_note TEXT,
    UNIQUE(catalog_id, product_id)
);

-- 14. CATALOG VERSIONS & SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.catalog_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catalog_id UUID NOT NULL REFERENCES public.catalogs(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL DEFAULT 1,
    snapshot_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.catalog_version_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL REFERENCES public.catalog_versions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_code TEXT NOT NULL,
    title TEXT NOT NULL,
    quoted_price NUMERIC(10, 2) NOT NULL,
    moq INTEGER NOT NULL,
    variants_snapshot JSONB
);

-- 15. CATALOG ACCESS EVENTS (Deduplicated views)
CREATE TABLE IF NOT EXISTS public.catalog_access_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catalog_id UUID NOT NULL REFERENCES public.catalogs(id) ON DELETE CASCADE,
    viewer_ip_hash TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. INQUIRIES
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_no TEXT NOT NULL UNIQUE,
    catalog_id UUID REFERENCES public.catalogs(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    buyer_name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    city TEXT,
    state TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'follow_up', 'closed')),
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_ref ON public.inquiries(reference_no);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_catalog ON public.inquiries(catalog_id);

-- 17. INQUIRY ITEMS
CREATE TABLE IF NOT EXISTS public.inquiry_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_code TEXT NOT NULL,
    product_title TEXT NOT NULL,
    product_image_url TEXT,
    quoted_price NUMERIC(10, 2) NOT NULL,
    size_breakdown JSONB NOT NULL,
    total_quantity INTEGER NOT NULL CHECK (total_quantity > 0),
    indicative_subtotal NUMERIC(12, 2) NOT NULL CHECK (indicative_subtotal >= 0),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_inquiry_items_inquiry ON public.inquiry_items(inquiry_id);

-- 18. INQUIRY STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.inquiry_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_rule_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_version_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_access_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_status_history ENABLE ROW LEVEL SECURITY;

-- Anonymous public read policies for products and catalogs
CREATE POLICY "Public can view active products" ON public.products
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public can view categories" ON public.categories
    FOR SELECT USING (TRUE);

CREATE POLICY "Public can view collections" ON public.collections
    FOR SELECT USING (TRUE);

CREATE POLICY "Public can view product images" ON public.product_images
    FOR SELECT USING (TRUE);

CREATE POLICY "Public can view product variants" ON public.product_variants
    FOR SELECT USING (TRUE);

CREATE POLICY "Public can view product collections" ON public.product_collections
    FOR SELECT USING (TRUE);

CREATE POLICY "Public can view active catalogs by token" ON public.catalogs
    FOR SELECT USING (status = 'active' AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Public can insert inquiry" ON public.inquiries
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Public can insert inquiry items" ON public.inquiry_items
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Public can record catalog access" ON public.catalog_access_events
    FOR INSERT WITH CHECK (TRUE);

-- Authenticated Admin full access policies
CREATE POLICY "Admins full access profiles" ON public.profiles
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins full access products" ON public.products
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins full access categories" ON public.categories
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins full access collections" ON public.collections
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins full access images" ON public.product_images
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins full access variants" ON public.product_variants
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins full access product_collections" ON public.product_collections
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins full access customers" ON public.customers
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins full access catalogs" ON public.catalogs
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins full access catalog rules" ON public.catalog_rules
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins full access catalog rule groups" ON public.catalog_rule_groups
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins full access catalog overrides" ON public.catalog_overrides
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins full access inquiries" ON public.inquiries
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins full access inquiry items" ON public.inquiry_items
    FOR ALL USING (auth.role() = 'authenticated');
