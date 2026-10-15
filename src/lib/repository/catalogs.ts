import { Catalog, Customer } from '@/types';
import { SEED_CATALOGS, SEED_CUSTOMERS } from '@/lib/data/seed-data';
import { createAdminClient } from '@/lib/supabase/admin';

let inMemoryCatalogs: Catalog[] = [...SEED_CATALOGS];
let inMemoryCustomers: Customer[] = [...SEED_CUSTOMERS];

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes('placeholder') && !url.includes('your-project-id'));
}

export async function getAllCatalogs(): Promise<Catalog[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('catalogs')
        .select(`
          *,
          customer:customers(*),
          rule_groups:catalog_rule_groups(
            *,
            rules:catalog_rules(*)
          ),
          overrides:catalog_overrides(*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch {}
  }

  return [...inMemoryCatalogs];
}

export async function getCatalogByToken(token: string): Promise<Catalog | null> {
  const catalogs = await getAllCatalogs();
  const catalog = catalogs.find(c => c.public_token === token);
  if (!catalog) return null;

  // Check if expired
  if (catalog.expires_at && new Date(catalog.expires_at) < new Date()) {
    return { ...catalog, status: 'expired' };
  }

  return catalog;
}

export async function getCatalogById(id: string): Promise<Catalog | null> {
  const catalogs = await getAllCatalogs();
  return catalogs.find(c => c.id === id) || null;
}

export async function saveCatalog(catalogData: Partial<Catalog>): Promise<Catalog> {
  if (catalogData.id) {
    const index = inMemoryCatalogs.findIndex(c => c.id === catalogData.id);
    if (index !== -1) {
      inMemoryCatalogs[index] = {
        ...inMemoryCatalogs[index],
        ...catalogData,
        updated_at: new Date().toISOString(),
      } as Catalog;
      return inMemoryCatalogs[index];
    }
  }

  const customer = inMemoryCustomers.find(c => c.id === catalogData.customer_id);

  const newCatalog: Catalog = {
    id: catalogData.id || `cat-${Date.now()}`,
    title: catalogData.title || 'Custom Wholesale Kurti Catalog',
    subtitle: catalogData.subtitle,
    public_token: catalogData.public_token || `cat-${Math.random().toString(36).substring(2, 10)}`,
    mode: catalogData.mode || 'dynamic',
    membership_type: catalogData.membership_type || 'dynamic',
    customer_id: catalogData.customer_id,
    customer: customer,
    status: catalogData.status || 'active',
    expires_at: catalogData.expires_at || null,
    access_code: catalogData.access_code || null,
    customer_greeting: catalogData.customer_greeting,
    custom_message: catalogData.custom_message,
    presentation_settings: catalogData.presentation_settings || {
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
    },
    rule_groups: catalogData.rule_groups || [],
    overrides: catalogData.overrides || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    views_count: 0,
    inquiries_count: 0,
  };

  inMemoryCatalogs.unshift(newCatalog);
  return newCatalog;
}

export async function updateCatalogStatus(id: string, status: 'active' | 'expired' | 'revoked'): Promise<boolean> {
  const catalog = inMemoryCatalogs.find(c => c.id === id);
  if (catalog) {
    catalog.status = status;
    catalog.updated_at = new Date().toISOString();
    return true;
  }
  return false;
}

export async function recordCatalogAccess(catalogId: string): Promise<void> {
  const catalog = inMemoryCatalogs.find(c => c.id === catalogId);
  if (catalog) {
    catalog.views_count = (catalog.views_count || 0) + 1;
  }
}

export async function getAllCustomers(): Promise<Customer[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase.from('customers').select('*').order('business_name');
      if (!error && data && data.length > 0) return data;
    } catch {}
  }
  return [...inMemoryCustomers];
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const customers = await getAllCustomers();
  return customers.find(c => c.id === id) || null;
}
