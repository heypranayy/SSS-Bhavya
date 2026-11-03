import type { Catalog, Category, Collection, Customer, Inquiry, Product } from '@/types';
import type { SupportTicket } from '@/types/tickets';
import type { ColumnValue, DocTable } from './index';

/**
 * Indexed columns stored next to each record's JSON `data`. Shared by the
 * repositories and the test database seeder so they never drift apart.
 */

const now = () => new Date().toISOString();

export function productColumns(p: Product): Record<string, ColumnValue> {
  return {
    code: p.code ?? null,
    slug: p.slug ?? null,
    is_active: p.is_active === false ? 0 : 1,
    created_at: p.created_at || now(),
    updated_at: p.updated_at || p.created_at || now(),
  };
}

export function categoryColumns(c: Category): Record<string, ColumnValue> {
  return { slug: c.slug ?? null, display_order: c.display_order ?? 0 };
}

export function collectionColumns(c: Collection): Record<string, ColumnValue> {
  return { slug: c.slug ?? null, display_order: c.display_order ?? 0 };
}

export function customerColumns(c: Customer): Record<string, ColumnValue> {
  return {
    business_name: c.business_name ?? null,
    created_at: c.created_at || now(),
    updated_at: c.updated_at ?? null,
  };
}

export function catalogColumns(c: Catalog): Record<string, ColumnValue> {
  return {
    public_token: c.public_token,
    status: c.status || 'active',
    created_at: c.created_at || now(),
    updated_at: c.updated_at || c.created_at || now(),
  };
}

export function inquiryColumns(i: Inquiry): Record<string, ColumnValue> {
  return {
    reference_no: i.reference_no ?? null,
    status: i.status || 'new',
    created_at: i.created_at || now(),
    updated_at: i.updated_at || i.created_at || now(),
  };
}

export interface BlogRecord {
  id: string;
  slug: string;
  date: string;
}

export function blogColumns(b: BlogRecord): Record<string, ColumnValue> {
  return { slug: b.slug ?? null, date: b.date || now() };
}

export function ticketColumns(t: SupportTicket): Record<string, ColumnValue> {
  return {
    ticket_number: t.ticket_number ?? null,
    status: t.status || 'open',
    created_at: t.created_at || now(),
    updated_at: t.updated_at || t.created_at || now(),
  };
}

export const COLUMNS_FOR: Partial<Record<DocTable, (doc: any) => Record<string, ColumnValue>>> = {
  products: productColumns,
  categories: categoryColumns,
  collections: collectionColumns,
  customers: customerColumns,
  catalogs: catalogColumns,
  inquiries: inquiryColumns,
  blogs: blogColumns,
  support_tickets: ticketColumns,
};
