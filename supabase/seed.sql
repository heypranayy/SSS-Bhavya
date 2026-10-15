-- ====================================================================
-- BHAVYA FASHIONS — Comprehensive B2B Seed Data
-- ====================================================================

-- 1. CATEGORIES
INSERT INTO public.categories (id, name, slug, description, display_order) VALUES
('c1000000-0000-0000-0000-000000000001', 'Single Kurtis', 'single-kurtis', 'Daily wear and designer single kurtis in straight, A-line and flared cuts', 1),
('c1000000-0000-0000-0000-000000000002', '2-Piece Kurti Pant Sets', 'kurti-pant-sets', 'Matched kurti and cigarette/palazzo pant 2-piece sets', 2),
('c1000000-0000-0000-0000-000000000003', '3-Piece Kurti Pant Dupatta Sets', 'kurti-pant-dupatta-sets', 'Premium ethnic 3-piece ensembles with dupatta', 3),
('c1000000-0000-0000-0000-000000000004', 'Co-ord Sets', 'coord-sets', 'Contemporary western-ethnic fusion printed co-ord sets', 4),
('c1000000-0000-0000-0000-000000000005', 'Anarkalis & Gowns', 'anarkalis-gowns', 'Floor length flared anarkalis and party wear gowns', 5)
ON CONFLICT (slug) DO NOTHING;

-- 2. COLLECTIONS
INSERT INTO public.collections (id, name, slug, description, image_url, is_featured, display_order) VALUES
('col00000-0000-0000-0000-000000000001', 'Royal Muslin 3-Piece Ensembles', 'royal-muslin-3pc', 'Luxurious pure muslin sets with organza cutwork dupattas for boutiques', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', TRUE, 1),
('col00000-0000-0000-0000-000000000002', 'Pure Cotton Summer Edit ''26', 'pure-cotton-summer-26', 'Breathable 60-60 cambric cotton prints perfect for retail fast-movers', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', TRUE, 2),
('col00000-0000-0000-0000-000000000003', 'Festive Chanderi Silk Collection', 'festive-chanderi-silk', 'Hand-embellished zari and sequence work on premium Chanderi fabric', 'https://images.unsplash.com/photo-1583391733975-29653a9e223b?auto=format&fit=crop&w=800&q=80', TRUE, 3),
('col00000-0000-0000-0000-000000000004', 'Alia & Nayra Cut Hit Designs', 'alia-nayra-cut-hits', 'Trending v-neck pleated Alia cut and side slit Nayra cut kurtis', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80', TRUE, 4),
('col00000-0000-0000-0000-000000000005', 'Designer Fusion Co-ords', 'designer-fusion-coords', 'Modern notch collar and wrap style coord sets for young fashion stores', 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80', FALSE, 5)
ON CONFLICT (slug) DO NOTHING;

-- 3. PRODUCTS
INSERT INTO public.products (id, code, title, slug, description, category_id, fabric, color, style_type, base_wholesale_price, currency, moq, stock_status, is_active, is_featured) VALUES
('p0000000-0000-0000-0000-000000000001', 'BF-3PC-101', 'Gulmohar Embroidered Muslin 3-Piece Set', 'gulmohar-embroidered-muslin-3pc', 'Premium pure muslin kurti with delicate hand zari thread embroidery around the neckline, paired with matched straight pant and digitally printed scalloped organza dupatta.', 'c1000000-0000-0000-0000-000000000003', 'Pure Muslin Silk', 'Muted Wine', '3-Piece Kurti Pant Dupatta', 899.00, 'INR', 6, 'in_stock', TRUE, TRUE),

('p0000000-0000-0000-0000-000000000002', 'BF-COT-102', 'Jaipuri Bagru Print Cambric Cotton 2-Piece', 'jaipuri-bagru-print-cotton-2pc', 'Authentic Jaipuri hand-block look Bagru floral print kurti in 60-60 pure cambric cotton with wooden button placket and paired ankle-length afghani pant.', 'c1000000-0000-0000-0000-000000000002', 'Pure Cambric Cotton 60-60', 'Indigo Blue', '2-Piece Kurti Pant', 549.00, 'INR', 8, 'in_stock', TRUE, TRUE),

('p0000000-0000-0000-0000-000000000003', 'BF-ALI-103', 'Noor Alia Cut Pleated Rayon Kurti', 'noor-alia-cut-pleated-rayon-kurti', 'Extremely popular Alia cut flared silhouette featuring zari sequin yoke embroidery, high side flares and 3/4 sleeves in heavy 14kg breathable rayon.', 'c1000000-0000-0000-0000-000000000001', 'Heavy Rayon 14kg', 'Rani Pink', 'Alia Cut Straight Flared', 449.00, 'INR', 10, 'in_stock', TRUE, TRUE),

('p0000000-0000-0000-0000-000000000004', 'BF-CHA-104', 'Royal Heritage Chanderi Zari Suit Set', 'royal-heritage-chanderi-zari-suit-set', 'Festive occasion wear Chanderi kurti with golden foil print, heavy sequin dori border work, santoon silk inner lining, cigarette pant and jacquard weaving dupatta.', 'c1000000-0000-0000-0000-000000000003', 'Chanderi Silk', 'Emerald Green', '3-Piece Kurti Pant Dupatta', 1199.00, 'INR', 6, 'in_stock', TRUE, TRUE),

('p0000000-0000-0000-0000-000000000005', 'BF-CRD-105', 'Urban Chic Bohemian Cotton Co-ord Set', 'urban-chic-bohemian-cotton-coord', 'Top-selling western ethnic fusion silhouette with asymmetric hemline top and relaxed trouser in pre-washed breathable cotton slub.', 'c1000000-0000-0000-0000-000000000004', 'Cotton Slub', 'Mustard Yellow', 'Co-ord Set', 625.00, 'INR', 8, 'in_stock', TRUE, TRUE),

('p0000000-0000-0000-0000-000000000006', 'BF-ANK-106', 'Kashmiri Tilla Embroidered Flared Anarkali', 'kashmiri-tilla-embroidered-anarkali', 'Full 3.5 meter flair floor-length party wear Anarkali kurti crafted from premium georgette with micro-tilla embroidery and matching dupatta.', 'c1000000-0000-0000-0000-000000000005', 'Viscose Georgette', 'Burgundy Wine', 'Anarkali Gown', 1250.00, 'INR', 6, 'in_stock', TRUE, TRUE),

('p0000000-0000-0000-0000-000000000007', 'BF-NAY-107', 'Meera Nayra Cut Mirror Work Kurti Set', 'meera-nayra-cut-mirror-work-kurti-set', 'Side-slit high cut Nayra style kurti with real foil mirror work and thread embroidery paired with comfortable stretch pant.', 'c1000000-0000-0000-0000-000000000002', 'Cotton Silk Blend', 'Teal Green', 'Nayra Cut 2-Piece', 675.00, 'INR', 8, 'in_stock', TRUE, FALSE),

('p0000000-0000-0000-0000-000000000008', 'BF-KRT-108', 'Daily Elegance Straight Cotton Office Kurti', 'daily-elegance-straight-cotton-kurti', 'Smart minimal collar kurti with subtle kantha stitching along the placket. Ideal daily office staple for retailers.', 'c1000000-0000-0000-0000-000000000001', 'Pure Cotton 60-60', 'Off White & Charcoal', 'Straight Kurti', 380.00, 'INR', 12, 'in_stock', TRUE, FALSE)
ON CONFLICT (code) DO NOTHING;

-- 4. PRODUCT IMAGES
INSERT INTO public.product_images (product_id, image_url, display_order, is_primary) VALUES
('p0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85', 0, TRUE),
('p0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85', 1, FALSE),
('p0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1583391733975-29653a9e223b?auto=format&fit=crop&w=1000&q=85', 0, TRUE),
('p0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=85', 0, TRUE),
('p0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1610030469668-93510cb28664?auto=format&fit=crop&w=1000&q=85', 0, TRUE),
('p0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=85', 0, TRUE),
('p0000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=85', 0, TRUE),
('p0000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=85', 0, TRUE),
('p0000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85', 0, TRUE);

-- 5. PRODUCT VARIANTS (Standard sizes M, L, XL, XXL, 3XL)
INSERT INTO public.product_variants (product_id, size, stock_quantity, is_available)
SELECT p.id, s.size, 60, TRUE
FROM public.products p
CROSS JOIN (VALUES ('M'), ('L'), ('XL'), ('XXL'), ('3XL')) AS s(size)
ON CONFLICT (product_id, size) DO NOTHING;

-- 6. PRODUCT COLLECTIONS MAPPING
INSERT INTO public.product_collections (product_id, collection_id) VALUES
('p0000000-0000-0000-0000-000000000001', 'col00000-0000-0000-0000-000000000001'),
('p0000000-0000-0000-0000-000000000002', 'col00000-0000-0000-0000-000000000002'),
('p0000000-0000-0000-0000-000000000003', 'col00000-0000-0000-0000-000000000004'),
('p0000000-0000-0000-0000-000000000004', 'col00000-0000-0000-0000-000000000003'),
('p0000000-0000-0000-0000-000000000005', 'col00000-0000-0000-0000-000000000005'),
('p0000000-0000-0000-0000-000000000006', 'col00000-0000-0000-0000-000000000003'),
('p0000000-0000-0000-0000-000000000007', 'col00000-0000-0000-0000-000000000004'),
('p0000000-0000-0000-0000-000000000008', 'col00000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- 7. SAMPLE CUSTOMERS
INSERT INTO public.customers (id, business_name, contact_person, phone, email, city, state, segment, discount_pct, custom_price_tier, notes) VALUES
('cust0000-0000-0000-0000-000000000001', 'Radha Krishna Ethnic Hub', 'Rajesh Gupta', '+91 98301 22334', 'rajesh@radhakrishna.in', 'Kolkata', 'West Bengal', 'Wholesaler / Large Retailer', 5.00, 'tier_gold', 'Key account in Barabazar, purchases 500+ pcs monthly'),
('cust0000-0000-0000-0000-000000000002', 'Vogue Ladies Boutique', 'Ananya Sharma', '+91 98205 66778', 'ananya@vogueboutique.co.in', 'Mumbai', 'Maharashtra', 'Boutique Store', 0.00, 'standard', 'High-end suburban boutique, focuses on 3pc Muslin and Chanderi sets'),
('cust0000-0000-0000-0000-000000000003', 'Surat Textile Resellers Network', 'Ketan Patel', '+91 94261 88990', 'ketan@suratresellers.com', 'Surat', 'Gujarat', 'Reseller Network', 8.00, 'tier_vip', 'Bulk reseller distributing across Saurashtra')
ON CONFLICT DO NOTHING;

-- 8. SAMPLE CATALOG
INSERT INTO public.catalogs (
    id, title, subtitle, public_token, mode, membership_type, customer_id, status, expires_at,
    customer_greeting, custom_message, presentation_settings
) VALUES (
    'cat00000-0000-0000-0000-000000000001',
    'Exclusive Summer & Festive Lookbook 2026',
    'Curated wholesale collection for premium retail boutiques',
    'bhavya-vip-summer-2026',
    'hybrid',
    'dynamic',
    'cust0000-0000-0000-0000-000000000001',
    'active',
    NOW() + INTERVAL '30 days',
    'Dear Rajesh ji (Radha Krishna Ethnic Hub),',
    'We are pleased to share our newest 2026 season wholesale kurti lookbook. Minimum order quantity is 6 pieces per design (ratio packing M, L, XL, XXL). Please review designs and submit your requirement directly below.',
    '{"showPrices": true, "showMoq": true, "showSizes": true, "layout": "grid", "columns": 3, "allowInquiry": true, "brandColor": "#722F37"}'::jsonb
) ON CONFLICT (public_token) DO NOTHING;
