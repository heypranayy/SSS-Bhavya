import fs from 'fs';
import path from 'path';
import { Catalog, Customer } from '@/types';
import { SEED_CATALOGS, SEED_CUSTOMERS } from '@/lib/data/seed-data';
import { createAdminClient } from '@/lib/supabase/admin';
import { getFirebaseDb, isFirebaseConfigured, sanitizeForFirestore } from '@/lib/firebase/config';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

let inMemoryCatalogs: Catalog[] = [...SEED_CATALOGS];
let inMemoryCustomers: Customer[] = [...SEED_CUSTOMERS];

function getCustomCatalogsFilePath(): string {
  return path.join(process.cwd(), 'src', 'lib', 'data', 'custom-catalogs.json');
}

function loadPersistedCatalogs(): Catalog[] {
  try {
    const filePath = getCustomCatalogsFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      if (data.trim()) {
        return JSON.parse(data);
      }
    }
  } catch (err) {
    console.error('Failed to read custom catalogs file:', err);
  }
  return [];
}

function savePersistedCatalogs(catalogs: Catalog[]): void {
  try {
    const filePath = getCustomCatalogsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(catalogs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write custom catalogs file:', err);
  }
}

function getDeletedCatalogsFilePath(): string {
  return path.join(process.cwd(), 'src', 'lib', 'data', 'deleted-catalogs.json');
}

function loadDeletedCatalogIds(): Set<string> {
  try {
    const filePath = getDeletedCatalogsFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      if (data.trim()) {
        const arr = JSON.parse(data);
        if (Array.isArray(arr)) return new Set(arr);
      }
    }
  } catch {}
  return new Set();
}

function saveDeletedCatalogIds(ids: Set<string>): void {
  try {
    const filePath = getDeletedCatalogsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(Array.from(ids), null, 2), 'utf-8');
  } catch {}
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes('placeholder') && !url.includes('your-project-id'));
}

export async function getAllCatalogs(): Promise<Catalog[]> {
  const deletedIds = loadDeletedCatalogIds();
  const persisted = loadPersistedCatalogs();
  const mergedMap = new Map<string, Catalog>();

  for (const c of SEED_CATALOGS) {
    if (!deletedIds.has(c.id) && !deletedIds.has(c.public_token)) {
      mergedMap.set(c.id, c);
    }
  }
  for (const c of inMemoryCatalogs) {
    if (!deletedIds.has(c.id) && !deletedIds.has(c.public_token)) {
      mergedMap.set(c.id, c);
    }
  }
  for (const c of persisted) {
    if (!deletedIds.has(c.id) && !deletedIds.has(c.public_token)) {
      mergedMap.set(c.id, c);
    }
  }

  // 1. Primary: Firestore
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        const snap = await getDocs(collection(db, 'catalogs'));
        if (!snap.empty) {
          snap.forEach((docSnap) => {
            const data = docSnap.data() as Catalog;
            if (data && data.id && !deletedIds.has(data.id) && !deletedIds.has(data.public_token)) {
              mergedMap.set(data.id, data);
            }
          });
        }
      }
    } catch (err) {
      console.warn('Firebase catalogs fetch notice:', err);
    }
  }

  // 2. Supabase fallback
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

  const all = Array.from(mergedMap.values());
  inMemoryCatalogs = all;
  return all;
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
  const persisted = loadPersistedCatalogs();
  const customer = inMemoryCustomers.find(c => c.id === catalogData.customer_id);

  if (catalogData.id) {
    // If it was in deleted IDs, restore it since user is actively saving it
    const deletedIds = loadDeletedCatalogIds();
    if (deletedIds.has(catalogData.id)) {
      deletedIds.delete(catalogData.id);
      if (catalogData.public_token) deletedIds.delete(catalogData.public_token);
      saveDeletedCatalogIds(deletedIds);
    }

    const pIdx = persisted.findIndex(c => c.id === catalogData.id);
    if (pIdx !== -1) {
      persisted[pIdx] = {
        ...persisted[pIdx],
        ...catalogData,
        customer: customer || persisted[pIdx].customer,
        updated_at: new Date().toISOString(),
      } as Catalog;
      savePersistedCatalogs(persisted);
      inMemoryCatalogs = inMemoryCatalogs.map(c => c.id === catalogData.id ? persisted[pIdx] : c);

      if (isFirebaseConfigured()) {
        try {
          const db = getFirebaseDb();
          if (db) {
            await setDoc(doc(db, 'catalogs', persisted[pIdx].id), sanitizeForFirestore(persisted[pIdx]), { merge: true });
          }
        } catch (err) {
          console.error('Failed to sync catalog to Firebase:', err);
        }
      }

      return persisted[pIdx];
    } else {
      // Existing seed or in-memory catalog edited for the first time
      const existing = [...SEED_CATALOGS, ...inMemoryCatalogs].find(c => c.id === catalogData.id);
      const updatedCatalog: Catalog = {
        ...(existing || {}),
        ...catalogData,
        id: catalogData.id,
        customer: customer || existing?.customer,
        created_at: existing?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views_count: existing?.views_count || 0,
        inquiries_count: existing?.inquiries_count || 0,
        share_count: existing?.share_count || 0,
        share_history: existing?.share_history || [],
      } as Catalog;

      persisted.unshift(updatedCatalog);
      savePersistedCatalogs(persisted);
      inMemoryCatalogs = inMemoryCatalogs.map(c => c.id === catalogData.id ? updatedCatalog : c);
      if (!inMemoryCatalogs.some(c => c.id === catalogData.id)) {
        inMemoryCatalogs.unshift(updatedCatalog);
      }

      if (isFirebaseConfigured()) {
        try {
          const db = getFirebaseDb();
          if (db) {
            await setDoc(doc(db, 'catalogs', updatedCatalog.id), sanitizeForFirestore(updatedCatalog), { merge: true });
          }
        } catch (err) {
          console.error('Failed to sync catalog to Firebase:', err);
        }
      }

      return updatedCatalog;
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

  persisted.unshift(newCatalog);
  savePersistedCatalogs(persisted);
  inMemoryCatalogs.unshift(newCatalog);

  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        await setDoc(doc(db, 'catalogs', newCatalog.id), sanitizeForFirestore(newCatalog), { merge: true });
      }
    } catch (err) {
      console.error('Failed to create catalog in Firebase:', err);
    }
  }

  return newCatalog;
}

export async function updateCatalogStatus(id: string, status: 'active' | 'expired' | 'revoked'): Promise<boolean> {
  const persisted = loadPersistedCatalogs();
  const cat = persisted.find(c => c.id === id);
  if (cat) {
    cat.status = status;
    cat.updated_at = new Date().toISOString();
    savePersistedCatalogs(persisted);
  }
  const inMem = inMemoryCatalogs.find(c => c.id === id);
  if (inMem) {
    inMem.status = status;
    inMem.updated_at = new Date().toISOString();
  }

  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        await setDoc(doc(db, 'catalogs', id), { status, updated_at: new Date().toISOString() }, { merge: true });
      }
    } catch {}
  }

  return Boolean(cat || inMem);
}

export async function recordCatalogAccess(catalogId: string): Promise<void> {
  const all = await getAllCatalogs();
  const cat = all.find(c => c.id === catalogId || c.public_token === catalogId);
  if (cat) {
    cat.views_count = (cat.views_count || 0) + 1;
    await saveCatalog(cat);
  }
}

export async function recordCatalogInquiry(catalogId: string): Promise<void> {
  const all = await getAllCatalogs();
  const cat = all.find(c => c.id === catalogId || c.public_token === catalogId);
  if (cat) {
    cat.inquiries_count = (cat.inquiries_count || 0) + 1;
    await saveCatalog(cat);
  }
}

export async function recordCatalogShare(
  catalogId: string,
  channel: string = 'whatsapp',
  recipient?: string
): Promise<Catalog | null> {
  const all = await getAllCatalogs();
  const cat = all.find(c => c.id === catalogId || c.public_token === catalogId);
  if (!cat) return null;

  const newShare = {
    id: `share-${Date.now()}`,
    channel,
    recipient: recipient || '',
    shared_to: recipient || '',
    shared_at: new Date().toISOString(),
    timestamp: new Date().toISOString(),
  };

  const updatedHistory = [newShare, ...(cat.share_history || [])];
  const updatedCat: Catalog = {
    ...cat,
    share_count: (cat.share_count || 0) + 1,
    share_history: updatedHistory as any,
    updated_at: new Date().toISOString(),
  };

  const persisted = loadPersistedCatalogs();
  const pIdx = persisted.findIndex(c => c.id === cat.id || c.public_token === cat.public_token);
  if (pIdx !== -1) {
    persisted[pIdx] = updatedCat;
  } else {
    persisted.unshift(updatedCat);
  }
  savePersistedCatalogs(persisted);
  inMemoryCatalogs = inMemoryCatalogs.map(c => (c.id === cat.id ? updatedCat : c));

  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        await setDoc(doc(db, 'catalogs', updatedCat.id), sanitizeForFirestore(updatedCat), { merge: true });
      }
    } catch {}
  }

  return updatedCat;
}

export async function logCatalogShare(catalogId: string, shareData: { shared_to: string; shared_by?: string; notes?: string }): Promise<void> {
  await recordCatalogShare(catalogId, 'whatsapp', shareData.shared_to);
}

function getCustomCustomersFilePath(): string {
  return path.join(process.cwd(), 'src', 'lib', 'data', 'custom-customers.json');
}

function loadPersistedCustomers(): Customer[] {
  try {
    const filePath = getCustomCustomersFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      if (data.trim()) {
        return JSON.parse(data);
      }
    }
  } catch (err) {
    console.error('Failed to read custom customers:', err);
  }
  return [];
}

function savePersistedCustomers(customers: Customer[]): void {
  try {
    const filePath = getCustomCustomersFilePath();
    fs.writeFileSync(filePath, JSON.stringify(customers, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write custom customers:', err);
  }
}

export async function getAllCustomers(): Promise<Customer[]> {
  const persisted = loadPersistedCustomers();
  const mergedMap = new Map<string, Customer>();

  for (const c of SEED_CUSTOMERS) {
    mergedMap.set(c.id, c);
  }
  for (const c of inMemoryCustomers) {
    mergedMap.set(c.id, c);
  }
  for (const c of persisted) {
    mergedMap.set(c.id, c);
  }

  const all = Array.from(mergedMap.values());
  inMemoryCustomers = all;

  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        const snap = await getDocs(collection(db, 'customers'));
        if (!snap.empty) {
          const list: Customer[] = [];
          snap.forEach((d) => list.push(d.data() as Customer));
          if (list.length > 0) return list;
        }
      }
    } catch {}
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase.from('customers').select('*').order('business_name');
      if (!error && data && data.length > 0) return data;
    } catch {}
  }
  return [...all];
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const customers = await getAllCustomers();
  return customers.find(c => c.id === id) || null;
}

export async function saveCustomer(customerData: Partial<Customer>): Promise<Customer> {
  const persisted = loadPersistedCustomers();

  if (customerData.id) {
    const idx = persisted.findIndex(c => c.id === customerData.id);
    if (idx !== -1) {
      persisted[idx] = {
        ...persisted[idx],
        ...customerData,
        updated_at: new Date().toISOString(),
      } as Customer;
      savePersistedCustomers(persisted);
      await getAllCustomers();

      if (isFirebaseConfigured()) {
        try {
          const db = getFirebaseDb();
          if (db) {
            await setDoc(doc(db, 'customers', persisted[idx].id), sanitizeForFirestore(persisted[idx]), { merge: true });
          }
        } catch {}
      }

      return persisted[idx];
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

  persisted.unshift(newCust);
  savePersistedCustomers(persisted);
  inMemoryCustomers.unshift(newCust);

  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        await setDoc(doc(db, 'customers', newCust.id), sanitizeForFirestore(newCust), { merge: true });
      }
    } catch {}
  }

  return newCust;
}

export async function deleteCustomer(id: string): Promise<boolean> {
  const persisted = loadPersistedCustomers();
  const filtered = persisted.filter(c => c.id !== id);
  if (filtered.length !== persisted.length) {
    savePersistedCustomers(filtered);
  }
  inMemoryCustomers = inMemoryCustomers.filter(c => c.id !== id);

  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        await deleteDoc(doc(db, 'customers', id));
      }
    } catch {}
  }

  return true;
}

export async function deleteCatalog(id: string): Promise<boolean> {
  const deletedIds = loadDeletedCatalogIds();
  deletedIds.add(id);

  const all = [...loadPersistedCatalogs(), ...inMemoryCatalogs, ...SEED_CATALOGS];
  const target = all.find(c => c.id === id || c.public_token === id);
  if (target) {
    deletedIds.add(target.id);
    if (target.public_token) deletedIds.add(target.public_token);
  }
  saveDeletedCatalogIds(deletedIds);

  const persisted = loadPersistedCatalogs();
  const filtered = persisted.filter(c => c.id !== id && c.public_token !== id);
  savePersistedCatalogs(filtered);
  inMemoryCatalogs = inMemoryCatalogs.filter(c => c.id !== id && c.public_token !== id);

  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        await deleteDoc(doc(db, 'catalogs', id));
        if (target && target.id !== id) {
          await deleteDoc(doc(db, 'catalogs', target.id));
        }
      }
    } catch {}
  }

  return true;
}
