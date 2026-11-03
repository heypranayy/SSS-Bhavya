import { Catalog, Customer } from '@/types';
import { getDb, getDoc, listDocs, putDoc } from '@/lib/db';
import { catalogColumns, customerColumns } from '@/lib/db/rows';

export async function getAllCatalogs(): Promise<Catalog[]> {
  return listDocs<Catalog>('catalogs', 'created_at DESC');
}

async function findCatalog(idOrToken: string): Promise<Catalog | null> {
  const row = await getDb()
    .prepare('SELECT data FROM catalogs WHERE id = ? OR public_token = ? LIMIT 1')
    .bind(idOrToken, idOrToken)
    .first<{ data: string }>();
  return row ? (JSON.parse(row.data) as Catalog) : null;
}

async function writeCatalog(catalog: Catalog): Promise<Catalog> {
  await putDoc('catalogs', catalog.id, catalogColumns(catalog), catalog);
  return catalog;
}

export async function getCatalogByToken(token: string): Promise<Catalog | null> {
  const catalog = await getDb()
    .prepare('SELECT data FROM catalogs WHERE public_token = ?')
    .bind(token)
    .first<{ data: string }>()
    .then((row) => (row ? (JSON.parse(row.data) as Catalog) : null));
  if (!catalog) return null;

  // Check if expired
  if (catalog.expires_at && new Date(catalog.expires_at) < new Date()) {
    return { ...catalog, status: 'expired' };
  }

  return catalog;
}

export async function getCatalogById(id: string): Promise<Catalog | null> {
  return getDoc<Catalog>('catalogs', id);
}

export async function saveCatalog(catalogData: Partial<Catalog>): Promise<Catalog> {
  const customer = catalogData.customer_id ? await getCustomerById(catalogData.customer_id) : null;

  if (catalogData.id) {
    const existing = await getDoc<Catalog>('catalogs', catalogData.id);
    if (existing) {
      return writeCatalog({
        ...existing,
        ...catalogData,
        customer: customer || existing.customer,
        updated_at: new Date().toISOString(),
      } as Catalog);
    }
  }

  const newCatalog: Catalog = {
    id: catalogData.id || `cat-${Date.now()}`,
    title: catalogData.title || 'Custom Wholesale Kurti Catalog',
    subtitle: catalogData.subtitle,
    public_token: catalogData.public_token || `cat-${Math.random().toString(36).substring(2, 10)}`,
    mode: catalogData.mode || 'dynamic',
    membership_type: catalogData.membership_type || 'dynamic',
    customer_id: catalogData.customer_id,
    customer: customer || undefined,
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

  return writeCatalog(newCatalog);
}

export async function updateCatalogStatus(id: string, status: 'active' | 'expired' | 'revoked'): Promise<boolean> {
  const cat = await getDoc<Catalog>('catalogs', id);
  if (!cat) return false;
  await writeCatalog({ ...cat, status, updated_at: new Date().toISOString() });
  return true;
}

export async function recordCatalogAccess(catalogId: string): Promise<void> {
  const cat = await findCatalog(catalogId);
  if (cat) {
    await writeCatalog({ ...cat, views_count: (cat.views_count || 0) + 1 });
  }
}

export async function recordCatalogInquiry(catalogId: string): Promise<void> {
  const cat = await findCatalog(catalogId);
  if (cat) {
    await writeCatalog({ ...cat, inquiries_count: (cat.inquiries_count || 0) + 1 });
  }
}

export async function recordCatalogShare(
  catalogId: string,
  channel: string = 'whatsapp',
  recipient?: string
): Promise<Catalog | null> {
  const cat = await findCatalog(catalogId);
  if (!cat) return null;

  const newShare = {
    id: `share-${Date.now()}`,
    channel,
    recipient: recipient || '',
    shared_to: recipient || '',
    shared_at: new Date().toISOString(),
    timestamp: new Date().toISOString(),
  };

  return writeCatalog({
    ...cat,
    share_count: (cat.share_count || 0) + 1,
    share_history: [newShare, ...(cat.share_history || [])] as Catalog['share_history'],
    updated_at: new Date().toISOString(),
  });
}

export async function logCatalogShare(catalogId: string, shareData: { shared_to: string; shared_by?: string; notes?: string }): Promise<void> {
  await recordCatalogShare(catalogId, 'whatsapp', shareData.shared_to);
}

export async function getAllCustomers(): Promise<Customer[]> {
  return listDocs<Customer>('customers', 'created_at DESC');
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  return getDoc<Customer>('customers', id);
}

export async function saveCustomer(customerData: Partial<Customer>): Promise<Customer> {
  if (customerData.id) {
    const existing = await getDoc<Customer>('customers', customerData.id);
    if (existing) {
      const updated = { ...existing, ...customerData, updated_at: new Date().toISOString() } as Customer;
      await putDoc('customers', updated.id, customerColumns(updated), updated);
      return updated;
    }
  }

  const newCust: Customer = {
    id: customerData.id || `cust-${Date.now()}`,
    business_name: customerData.business_name || 'Boutique Client',
    contact_person: customerData.contact_person || '',
    phone: customerData.phone || '',
    email: customerData.email,
    city: customerData.city || 'Kolkata',
    state: customerData.state || 'West Bengal',
    segment: customerData.segment || 'Boutique',
    custom_price_tier: customerData.custom_price_tier || 'standard',
    discount_pct: customerData.discount_pct || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await putDoc('customers', newCust.id, customerColumns(newCust), newCust);
  return newCust;
}

export async function deleteCustomer(id: string): Promise<boolean> {
  await getDb().prepare('DELETE FROM customers WHERE id = ?').bind(id).run();
  return true;
}

export async function deleteCatalog(id: string): Promise<boolean> {
  await getDb().prepare('DELETE FROM catalogs WHERE id = ? OR public_token = ?').bind(id, id).run();
  return true;
}
