export type StockStatus = 'in_stock' | 'low_stock' | 'made_to_order' | 'out_of_stock';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_order?: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_featured?: boolean;
  product_count?: number;
}

export interface ProductImage {
  id: string;
  product_id?: string;
  image_url: string;
  storage_path?: string;
  display_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  product_id?: string;
  size: string; // e.g. 'M', 'L', 'XL', 'XXL', '3XL'
  sku?: string;
  stock_quantity: number;
  is_available: boolean;
}

export interface Product {
  id: string;
  code: string;
  title: string;
  slug: string;
  description?: string;
  category_id?: string;
  category?: Category;
  fabric: string;
  color: string;
  style_type: string;
  base_wholesale_price: number;
  currency: string;
  moq: number;
  stock_status: StockStatus;
  is_active: boolean;
  is_featured: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  collections?: Collection[];
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  business_name: string;
  contact_person: string;
  phone: string;
  email?: string;
  city?: string;
  state?: string;
  segment?: string;
  discount_pct?: number; // e.g. 5.0 for 5% off
  custom_price_tier?: string;
  notes?: string;
  created_at: string;
}

export type CatalogMode = 'dynamic' | 'curated' | 'hybrid';
export type CatalogMembership = 'dynamic' | 'fixed';
export type CatalogStatus = 'draft' | 'active' | 'expired' | 'revoked';

export type FilterAttribute = 
  | 'category_id'
  | 'collection_id'
  | 'base_wholesale_price'
  | 'moq'
  | 'fabric'
  | 'color'
  | 'style_type'
  | 'stock_status'
  | 'is_featured';

export type FilterOperator = 
  | 'equals'
  | 'not_equals'
  | 'in'
  | 'not_in'
  | 'greater_than'
  | 'greater_than_or_equal'
  | 'less_than'
  | 'less_than_or_equal'
  | 'between'
  | 'contains'
  | 'not_contains'
  | 'is_empty'
  | 'is_not_empty';

export interface FilterRule {
  id: string;
  attribute: FilterAttribute;
  operator: FilterOperator;
  value: any; // string | number | string[] | [number, number]
}

export interface FilterRuleGroup {
  id: string;
  logical_operator: 'AND' | 'OR';
  rules: FilterRule[];
}

export interface CatalogOverride {
  id: string;
  product_id: string;
  action: 'include' | 'exclude';
  display_order: number;
  is_pinned?: boolean;
  presentation_note?: string;
}

export interface CatalogPresentationSettings {
  // Branding
  brandTitle?: string;
  brandSubtitle?: string;
  brandColor?: string; // Hex e.g. #722F37
  coverImageUrl?: string;
  showLogo?: boolean;
  introMessage?: string;
  greeting?: string;
  footerText?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  
  // Layout & Visibility
  layout: 'grid' | 'list';
  columnsDesktop: number; // 2, 3, 4
  columnsMobile: number; // 1, 2
  showPrices: boolean;
  showMoq: boolean;
  showSizes: boolean;
  showStockStatus: boolean;
  showDescription: boolean;
  imageAspectRatio: '3/4' | '1/1' | '4/5';

  // Customer Interaction
  allowSelection: boolean;
  allowSizeSelection: boolean;
  allowQuantityBreakdown: boolean;
  allowInquiry: boolean;
  allowCustomerNotes: boolean;
  allowAlternativeRequest: boolean;
}

export interface Catalog {
  id: string;
  title: string;
  subtitle?: string;
  public_token: string;
  mode: CatalogMode;
  membership_type: CatalogMembership;
  customer_id?: string;
  customer?: Customer;
  status: CatalogStatus;
  expires_at?: string | null;
  access_code?: string | null;
  customer_greeting?: string;
  custom_message?: string;
  presentation_settings: CatalogPresentationSettings;
  rule_groups?: FilterRuleGroup[];
  overrides?: CatalogOverride[];
  created_at: string;
  updated_at: string;
  views_count?: number;
  inquiries_count?: number;
}

export interface CatalogProductView extends Product {
  quoted_price: number;
  is_pinned?: boolean;
  presentation_note?: string;
  override_action?: 'include' | 'exclude';
}

export type InquiryStatus = 'new' | 'contacted' | 'follow_up' | 'closed';

export interface InquiryItem {
  id?: string;
  product_id?: string;
  product_code: string;
  product_title: string;
  product_image_url?: string;
  quoted_price: number;
  size_breakdown: Record<string, number>; // e.g. { "M": 2, "L": 4, "XL": 2 }
  total_quantity: number;
  indicative_subtotal: number;
  notes?: string;
}

export interface Inquiry {
  id: string;
  reference_no: string;
  catalog_id?: string;
  customer_id?: string;
  buyer_name: string;
  business_name: string;
  phone: string;
  email?: string;
  city?: string;
  state?: string;
  message?: string;
  status: InquiryStatus;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
  items: InquiryItem[];
}
