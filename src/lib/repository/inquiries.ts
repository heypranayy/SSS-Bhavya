import { Inquiry, InquiryStatus } from '@/types';
import { createAdminClient } from '@/lib/supabase/admin';

let inMemoryInquiries: Inquiry[] = [
  {
    id: 'inq-1001',
    reference_no: 'BF-INQ-78214',
    catalog_id: 'cat00000-0000-0000-0000-000000000001',
    customer_id: 'cust0000-0000-0000-0000-000000000001',
    buyer_name: 'Rajesh Gupta',
    business_name: 'Radha Krishna Ethnic Hub',
    phone: '+91 98301 22334',
    email: 'rajesh@radhakrishna.in',
    city: 'Kolkata',
    state: 'West Bengal',
    message: 'Please share freight estimates and dispatch timeline for Barabazar delivery.',
    status: 'new',
    internal_notes: 'Spoke briefly on phone, needs delivery by Monday.',
    created_at: '2026-03-02T14:20:00Z',
    updated_at: '2026-03-02T14:20:00Z',
    items: [
      {
        id: 'inq-item-1',
        product_id: 'p0000000-0000-0000-0000-000000000001',
        product_code: 'BF-3PC-101',
        product_title: 'Gulmohar Embroidered Muslin 3-Piece Set',
        product_image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85',
        quoted_price: 854.05, // 5% tier discount applied
        size_breakdown: { M: 4, L: 4, XL: 4, XXL: 2 },
        total_quantity: 14,
        indicative_subtotal: 11956.70,
        notes: 'Ratio packing preferred in standard poly bags',
      },
      {
        id: 'inq-item-2',
        product_id: 'p0000000-0000-0000-0000-000000000004',
        product_code: 'BF-CHA-104',
        product_title: 'Royal Heritage Chanderi Zari Suit Set',
        product_image_url: 'https://images.unsplash.com/photo-1610030469668-93510cb28664?auto=format&fit=crop&w=1000&q=85',
        quoted_price: 1139.05,
        size_breakdown: { M: 2, L: 4, XL: 2 },
        total_quantity: 8,
        indicative_subtotal: 9112.40,
        notes: 'Top seller for wedding counter display',
      },
    ],
  },
];

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes('placeholder') && !url.includes('your-project-id'));
}

export async function getAllInquiries(): Promise<Inquiry[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          *,
          items:inquiry_items(*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) return data;
    } catch {}
  }

  return [...inMemoryInquiries];
}

export async function getInquiryById(id: string): Promise<Inquiry | null> {
  const inquiries = await getAllInquiries();
  return inquiries.find(i => i.id === id || i.reference_no === id) || null;
}

export async function createInquiry(data: Omit<Inquiry, 'id' | 'reference_no' | 'created_at' | 'updated_at' | 'status'>): Promise<Inquiry> {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const referenceNo = `BF-INQ-${randomSuffix}`;

  const newInquiry: Inquiry = {
    ...data,
    id: `inq-${Date.now()}`,
    reference_no: referenceNo,
    status: 'new',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  inMemoryInquiries.unshift(newInquiry);

  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      await supabase.from('inquiries').insert({
        reference_no: referenceNo,
        catalog_id: data.catalog_id,
        customer_id: data.customer_id,
        buyer_name: data.buyer_name,
        business_name: data.business_name,
        phone: data.phone,
        email: data.email,
        city: data.city,
        state: data.state,
        message: data.message,
        status: 'new',
      });
    } catch {}
  }

  return newInquiry;
}

export async function updateInquiryStatus(id: string, status: InquiryStatus, internalNotes?: string): Promise<boolean> {
  const inquiry = inMemoryInquiries.find(i => i.id === id || i.reference_no === id);
  if (inquiry) {
    inquiry.status = status;
    if (internalNotes !== undefined) {
      inquiry.internal_notes = internalNotes;
    }
    inquiry.updated_at = new Date().toISOString();
    return true;
  }
  return false;
}
