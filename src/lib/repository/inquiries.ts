import { Inquiry, InquiryStatus } from '@/types';
import { getDb, listDocs, putDoc } from '@/lib/db';
import { inquiryColumns } from '@/lib/db/rows';

async function findInquiry(idOrRef: string): Promise<Inquiry | null> {
  const row = await getDb()
    .prepare('SELECT data FROM inquiries WHERE id = ? OR reference_no = ? LIMIT 1')
    .bind(idOrRef, idOrRef)
    .first<{ data: string }>();
  return row ? (JSON.parse(row.data) as Inquiry) : null;
}

async function writeInquiry(inquiry: Inquiry): Promise<void> {
  await putDoc('inquiries', inquiry.id, inquiryColumns(inquiry), inquiry);
}

export async function getAllInquiries(): Promise<Inquiry[]> {
  return listDocs<Inquiry>('inquiries', 'created_at DESC');
}

export async function getInquiryById(id: string): Promise<Inquiry | null> {
  return findInquiry(id);
}

export async function createInquiry(data: Omit<Inquiry, 'id' | 'reference_no' | 'created_at' | 'updated_at' | 'status'>): Promise<Inquiry> {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  let prefix = 'BF-CAT';
  if (data.inquiry_type === 'price_request') {
    prefix = 'BF-REQ';
  } else if (data.inquiry_type === 'website') {
    prefix = 'BF-WEB';
  }
  const referenceNo = `${prefix}-${randomSuffix}`;

  const newInquiry: Inquiry = {
    ...data,
    id: `inq-${Date.now()}`,
    reference_no: referenceNo,
    inquiry_type: data.inquiry_type || (data.catalog_id ? 'catalog' : 'website'),
    status: 'new',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await writeInquiry(newInquiry);
  return newInquiry;
}

export async function updateInquiryStatus(id: string, status: InquiryStatus, internalNotes?: string): Promise<boolean> {
  if (!id || typeof id !== 'string' || !id.trim()) return false;
  const inquiry = await findInquiry(id);
  if (!inquiry) return true;

  await writeInquiry({
    ...inquiry,
    status,
    ...(internalNotes !== undefined ? { internal_notes: internalNotes } : {}),
    updated_at: new Date().toISOString(),
  });
  return true;
}

export async function assignInquiryStaff(id: string, staffName: string): Promise<boolean> {
  if (!id || typeof id !== 'string' || !id.trim()) return false;
  const inquiry = await findInquiry(id);
  if (!inquiry) return true;

  await writeInquiry({ ...inquiry, assigned_staff: staffName, updated_at: new Date().toISOString() });
  return true;
}

export async function deleteInquiry(id: string): Promise<boolean> {
  if (!id || typeof id !== 'string' || !id.trim()) return false;
  await getDb().prepare('DELETE FROM inquiries WHERE id = ? OR reference_no = ?').bind(id, id).run();
  return true;
}
