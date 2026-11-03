import type { Category, Collection, Product, Customer, Catalog, Inquiry } from '@/types';
import type { SupportTicket } from '@/types/tickets';
import migratedProductsRaw from './migrated-products.json' with { type: 'json' };

export const SEED_CATEGORIES: Category[] = [
  {
    id: 'cat-3p-kurtis',
    name: 'Three-Piece Kurtis (3P)',
    slug: '3-piece-kurtis',
    description: 'Premium Kurti Pant Dupatta sets in Kesaria Silk, Modal, Muslin, and Chanderi',
    display_order: 1,
  },
  {
    id: 'cat-2p-kurtis',
    name: 'Two-Piece Kurtis (2P)',
    slug: '2-piece-kurtis',
    description: 'Matching Kurti and Pant / Palazzo sets for boutique counters',
    display_order: 2,
  },
  {
    id: 'cat-1p-kurtis',
    name: 'One-Piece Kurtis (1P)',
    slug: 'one-piece-kurtis',
    description: 'Designer straight, A-line and flared one-piece kurtis and daily tunics',
    display_order: 3,
  },
  {
    id: 'cat-coord-sets',
    name: 'Co-ord Sets',
    slug: 'coord-sets',
    description: 'Contemporary western-ethnic fusion printed and solid co-ord sets',
    display_order: 4,
  },
  {
    id: 'cat-single-kurtis',
    name: 'Single Kurtis',
    slug: 'single-kurtis',
    description: 'Daily wear and designer straight and A-line single kurtis',
    display_order: 5,
  },
  {
    id: 'cat-western-midi',
    name: 'Western Tops & Midis',
    slug: 'western-midi',
    description: 'Comfortable Western midi dresses, tops and casual tunics',
    display_order: 6,
  },
  {
    id: 'cat-gowns',
    name: 'Anarkalis & Gowns',
    slug: 'anarkalis-gowns',
    description: 'Flared party wear anarkalis, festive gowns and wedding collections',
    display_order: 7,
  },
];

export const SEED_COLLECTIONS: Collection[] = [
  {
    id: 'col-3p-catalogs',
    name: 'Three-Piece Ensembles (3P)',
    slug: '3-piece-kurtis',
    description: 'Kurti, pant and dupatta sets crafted from premium Kesaria Silk, Muslin, and Chanderi',
    image_url: '/images/cat-3piece.jpg',
    is_featured: true,
    product_count: 36,
  },
  {
    id: 'col-2p-catalogs',
    name: 'Two-Piece Sets (2P)',
    slug: '2-piece-kurtis',
    description: 'Chic Kurti and Pant coordinate sets for modern retail counters',
    image_url: '/images/cat-2piece.jpg',
    is_featured: true,
    product_count: 16,
  },
  {
    id: 'col-coord-catalogs',
    name: 'Contemporary Co-ords',
    slug: 'coord-sets',
    description: 'Western-ethnic fusion printed sets, notched collars and tunics',
    image_url: '/images/cat-coord.jpg',
    is_featured: true,
    product_count: 12,
  },
  {
    id: 'col-anarkali-catalogs',
    name: 'Flared Anarkalis & Gowns',
    slug: 'anarkalis-gowns',
    description: 'Grand kalidar silhouettes and partywear sets for festive & wedding seasons',
    image_url: '/images/cat-anarkali.jpg',
    is_featured: true,
    product_count: 8,
  },
  {
    id: 'col-single-catalogs',
    name: 'Single Kurtis & Tunics',
    slug: 'single-kurtis',
    description: 'Daily wear, office wear and designer straight-cut kurtis in 100% pure cotton',
    image_url: '/images/cat-3piece.jpg',
    is_featured: false,
    product_count: 6,
  },
  {
    id: 'col-western-catalogs',
    name: 'Western Tops & Midis',
    slug: 'western-midi',
    description: 'Trendy Indo-Western dresses, midi tunics and casual coordinate styles',
    image_url: '/images/cat-coord.jpg',
    is_featured: false,
    product_count: 6,
  },
];

export const SEED_CUSTOMERS: Customer[] = [
  {
    id: 'cust0000-0000-0000-0000-000000000001',
    business_name: 'Radha Krishna Ethnic Hub',
    contact_person: 'Rajesh Gupta',
    phone: '+91 98301 22334',
    email: 'rajesh@radhakrishna.in',
    city: 'Kolkata',
    state: 'West Bengal',
    segment: 'Wholesaler / Large Retailer',
    discount_pct: 5.0,
    custom_price_tier: 'tier_gold',
    notes: 'Key account in Barabazar, purchases 500+ pcs monthly',
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'cust0000-0000-0000-0000-000000000002',
    business_name: 'Vogue Ladies Boutique',
    contact_person: 'Ananya Sharma',
    phone: '+91 98205 66778',
    email: 'ananya@vogueboutique.co.in',
    city: 'Mumbai',
    state: 'Maharashtra',
    segment: 'Boutique Store',
    discount_pct: 0.0,
    custom_price_tier: 'standard',
    notes: 'High-end suburban boutique, focuses on 3pc Muslin and Chanderi sets',
    created_at: '2026-02-15T11:30:00Z',
  },
  {
    id: 'cust0000-0000-0000-0000-000000000003',
    business_name: 'Surat Textile Resellers Network',
    contact_person: 'Ketan Patel',
    phone: '+91 94261 88990',
    email: 'ketan@suratresellers.com',
    city: 'Surat',
    state: 'Gujarat',
    segment: 'Reseller Network',
    discount_pct: 8.0,
    custom_price_tier: 'tier_vip',
    notes: 'Bulk reseller distributing across Saurashtra',
    created_at: '2026-03-01T09:15:00Z',
  },
];

function getProductCollections(p: any): Collection[] {
  const matchedCols: Collection[] = [];
  const catId = (p.category_id || '').toLowerCase();
  const style = (p.style_type || '').toLowerCase();

  if (catId === 'cat-3p-kurtis' || style.includes('3-piece') || style.includes('three-piece')) {
    const col = SEED_COLLECTIONS.find(c => c.slug === '3-piece-kurtis');
    if (col) matchedCols.push(col);
  } else if (catId === 'cat-2p-kurtis' || style.includes('2-piece') || style.includes('two-piece')) {
    const col = SEED_COLLECTIONS.find(c => c.slug === '2-piece-kurtis');
    if (col) matchedCols.push(col);
  } else if (catId === 'cat-coord-sets' || style.includes('co-ord') || style.includes('coord')) {
    const col = SEED_COLLECTIONS.find(c => c.slug === 'coord-sets');
    if (col) matchedCols.push(col);
  } else if (catId === 'cat-gowns' || style.includes('anarkali') || style.includes('gown')) {
    const col = SEED_COLLECTIONS.find(c => c.slug === 'anarkalis-gowns');
    if (col) matchedCols.push(col);
  } else if (catId === 'cat-single-kurtis' || style.includes('single')) {
    const col = SEED_COLLECTIONS.find(c => c.slug === 'single-kurtis');
    if (col) matchedCols.push(col);
  } else if (catId === 'cat-western-midi' || style.includes('western') || style.includes('midi')) {
    const col = SEED_COLLECTIONS.find(c => c.slug === 'western-midi');
    if (col) matchedCols.push(col);
  }

  return matchedCols;
}

const mappedMigratedProducts: Product[] = (migratedProductsRaw as any[]).map((p) => {
  const images = (p.images || []).map((img: any) => ({
    ...img,
    image_url: img.local_url || img.image_url,
  }));

  return {
    ...p,
    images,
    price_display_mode: 'request',
    price_on_enquiry: true,
    price_on_request: true,
    category: SEED_CATEGORIES.find((c) => c.id === p.category_id) || SEED_CATEGORIES[0],
    collections: p.collections && p.collections.length > 0 ? p.collections : getProductCollections(p),
  };
});

export const SEED_PRODUCTS: Product[] = [
  ...mappedMigratedProducts,
];

export const SEED_CATALOGS: Catalog[] = [
  {
    id: 'cat00000-0000-0000-0000-000000000001',
    title: 'Exclusive Summer & Festive Lookbook 2026',
    subtitle: 'Curated wholesale collection for premium retail boutiques',
    public_token: 'bhavya-vip-summer-2026',
    mode: 'hybrid',
    membership_type: 'dynamic',
    customer_id: 'cust0000-0000-0000-0000-000000000001',
    customer: SEED_CUSTOMERS[0],
    status: 'active',
    expires_at: '2026-12-31T23:59:59Z',
    access_code: 'BF-2026-001',
    customer_greeting: 'Dear Rajesh ji (Radha Krishna Ethnic Hub),',
    custom_message: 'We are pleased to share our newest 2026 season wholesale kurti lookbook. Minimum order quantity is 6 pieces per design (ratio packing M, L, XL, XXL). Please review designs and submit your requirement directly below.',
    presentation_settings: {
      brandTitle: 'Bhavya Fashions Wholesale',
      brandSubtitle: 'Barabazar & Surat Hub Direct Supply',
      brandColor: '#722F37',
      layout: 'grid',
      columnsDesktop: 3,
      columnsMobile: 1,
      showPrices: true,
      showMoq: true,
      showSizes: true,
      showStockStatus: true,
      showDescription: true,
      imageAspectRatio: '3/4',
      allowSelection: true,
      allowSizeSelection: true,
      allowQuantityBreakdown: true,
      allowInquiry: true,
      allowCustomerNotes: true,
      allowAlternativeRequest: true,
      contactPhone: '+91 98307 29210',
      contactWhatsapp: '919830729210',
    },
    rule_groups: [
      {
        id: 'rg-1',
        logical_operator: 'AND',
        rules: [
          {
            id: 'r-1',
            attribute: 'base_wholesale_price',
            operator: 'less_than_or_equal',
            value: 1200,
          },
          {
            id: 'r-2',
            attribute: 'stock_status',
            operator: 'equals',
            value: 'in_stock',
          },
        ],
      },
    ],
    overrides: [
      {
        id: 'ov-1',
        product_id: 'p-migrated-29589',
        action: 'include',
        display_order: 0,
        is_pinned: true,
        presentation_note: '🌟 Top Recommended Festive Design for Wedding Season',
      },
    ],
    created_at: '2026-03-01T12:00:00Z',
    updated_at: '2026-03-01T12:00:00Z',
    views_count: 42,
    inquiries_count: 5,
  },
  {
    id: 'cat00000-0000-0000-0000-000000000002',
    title: 'Diwali Festive Preview 2025 (Expired)',
    subtitle: 'Archived festive wholesale collection',
    public_token: 'bhavya-festive-archive-2025',
    mode: 'dynamic',
    membership_type: 'dynamic',
    customer_id: 'cust0000-0000-0000-0000-000000000001',
    customer: SEED_CUSTOMERS[0],
    status: 'expired',
    expires_at: '2025-11-15T23:59:59Z',
    access_code: 'BF-EXP-2025',
    customer_greeting: 'Dear Retail Partner,',
    custom_message: 'This seasonal promotional wholesale catalogue has ended.',
    presentation_settings: {
      brandTitle: 'Bhavya Fashions Archive',
      layout: 'grid',
      columnsDesktop: 3,
      columnsMobile: 1,
      showPrices: false,
      showMoq: true,
      showSizes: true,
      showStockStatus: false,
      showDescription: true,
      imageAspectRatio: '3/4',
      allowSelection: false,
      allowSizeSelection: false,
      allowQuantityBreakdown: false,
      allowInquiry: true,
      allowCustomerNotes: false,
      allowAlternativeRequest: false,
      contactPhone: '+91 98307 29210',
      contactWhatsapp: '919830729210',
    },
    rule_groups: [],
    overrides: [],
    created_at: '2025-10-01T12:00:00Z',
    updated_at: '2025-11-16T00:00:00Z',
    views_count: 104,
    inquiries_count: 18,
  },
  {
    id: 'cat00000-0000-0000-0000-000000000003',
    title: 'Revoked Dealer Lookbook',
    subtitle: 'Inactive partner portfolio',
    public_token: 'bhavya-revoked-dealer-sample',
    mode: 'curated',
    membership_type: 'fixed',
    status: 'revoked',
    expires_at: '2026-12-31T23:59:59Z',
    access_code: 'BF-REV-999',
    customer_greeting: 'Dear Partner,',
    presentation_settings: {
      brandTitle: 'Bhavya Fashions',
      layout: 'grid',
      columnsDesktop: 3,
      columnsMobile: 1,
      showPrices: false,
      showMoq: true,
      showSizes: true,
      showStockStatus: false,
      showDescription: true,
      imageAspectRatio: '3/4',
      allowSelection: false,
      allowSizeSelection: false,
      allowQuantityBreakdown: false,
      allowInquiry: false,
      allowCustomerNotes: false,
      allowAlternativeRequest: false,
      contactPhone: '+91 98307 29210',
      contactWhatsapp: '919830729210',
    },
    rule_groups: [],
    overrides: [],
    created_at: '2026-01-10T12:00:00Z',
    updated_at: '2026-02-01T12:00:00Z',
    views_count: 8,
    inquiries_count: 0,
  },
];

// Sample inquiries that the admin desk has always shown alongside real ones.
export const SEED_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-1001',
    reference_no: 'BF-CAT-78214',
    inquiry_type: 'catalog',
    catalog_id: 'cat00000-0000-0000-0000-000000000001',
    catalog_title: 'Exclusive Summer & Festive Lookbook 2026',
    customer_id: 'cust0000-0000-0000-0000-000000000001',
    buyer_name: 'Rajesh Gupta',
    business_name: 'Radha Krishna Ethnic Hub',
    phone: '+91 98301 22334',
    email: 'rajesh@radhakrishna.in',
    city: 'Kolkata',
    state: 'West Bengal',
    source_page: '/catalog/bhavya-vip-summer-2026',
    assigned_staff: 'Amit Verma (Kolkata Sales)',
    message: 'Please share freight estimates and dispatch timeline for Barabazar delivery.',
    status: 'new',
    internal_notes: 'Spoke briefly on phone, needs delivery by Monday.',
    created_at: '2026-03-02T14:20:00Z',
    updated_at: '2026-03-02T14:20:00Z',
    items: [
      {
        id: 'inq-item-1',
        product_id: 'p-migrated-29589',
        product_code: 'DN11059',
        product_title: '11059 Kurti Pant Dupatta',
        product_image_url: '/images/products/dn11059-0.png',
        quoted_price: 569.05,
        size_breakdown: { L: 4, XL: 4, XXL: 4, '3XL': 2 },
        total_quantity: 14,
        indicative_subtotal: 7966.70,
        notes: 'Kesaria silk ratio packing in standard poly bags',
      },
      {
        id: 'inq-item-2',
        product_id: 'p-migrated-29579',
        product_code: 'DN11068',
        product_title: '11068 Kurti Pant',
        product_image_url: '/images/products/dn11068-0.png',
        quoted_price: 569.05,
        size_breakdown: { M: 2, L: 4, XL: 2 },
        total_quantity: 8,
        indicative_subtotal: 4552.40,
        notes: 'Top seller for summer festive counter display',
      },
    ],
  },
  {
    id: 'inq-1002',
    reference_no: 'BF-WEB-49120',
    inquiry_type: 'website',
    buyer_name: 'Pooja Agarwal',
    business_name: 'Agarwal Sarees & Kurtis',
    phone: '+91 98205 99182',
    email: 'pooja@agarwalsarees.com',
    city: 'Patna',
    state: 'Bihar',
    source_page: '/contact',
    assigned_staff: 'Sanjay Jain (B2B Dispatch)',
    message: 'We are expanding our ethnic wear showroom in Patna. Need your wholesale price list for 3-Piece Muslin & Kesaria Silk sets with dispatch to Patna via transport.',
    status: 'contacted',
    internal_notes: 'Sent initial PDF catalog on WhatsApp, waiting for retailer selection.',
    created_at: '2026-03-03T11:45:00Z',
    updated_at: '2026-03-03T12:00:00Z',
    items: [],
  },
  {
    id: 'inq-1003',
    reference_no: 'BF-WEB-51203',
    inquiry_type: 'website',
    buyer_name: 'Vikram Mehta',
    business_name: 'Mehta Fashion World',
    phone: '+91 98791 44321',
    email: 'vikram@mehtafashions.in',
    city: 'Ahmedabad',
    state: 'Gujarat',
    source_page: '/about',
    assigned_staff: 'Ravi Sharma (Surat Desk)',
    message: 'Interested in visiting your Surat production facility or receiving 500+ pcs lot sample swatches for western co-ords and 2-piece kurtis.',
    status: 'follow_up',
    internal_notes: 'Scheduled factory visit for next Tuesday.',
    created_at: '2026-03-04T09:10:00Z',
    updated_at: '2026-03-04T10:15:00Z',
    items: [],
  },
];

export const SEED_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-init-001',
    ticket_number: 'TKT-1001',
    title: 'Platform Handover & Initial Production Verification',
    category: 'bug_glitch',
    priority: 'medium',
    description: 'Initial B2B Wholesale deployment completed for Bhavya Fashions. System check and verification tickets active.',
    screen_url: '/admin',
    submitter_name: 'Bhavya Fashions Operations Desk',
    submitter_email: 'sss@bhavyafashions.com',
    submitter_phone: '+91 98307 29210',
    target_email: 'pranay@gexart.com',
    status: 'resolved',
    resolution_notes: 'All core features verified. Category routing, WhatsApp inquiry drawer, and mobile design drawer active.',
    created_at: '2026-10-23T10:00:00.000Z',
    updated_at: '2026-10-23T11:00:00.000Z',
    email_dispatched: true,
  },
];
