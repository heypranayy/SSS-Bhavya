import { Inquiry, InquiryStatus } from '@/types';
import { createAdminClient } from '@/lib/supabase/admin';
import { getFirebaseDb, isFirebaseConfigured } from '@/lib/firebase/config';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

let inMemoryInquiries: Inquiry[] = [
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
        product_image_url: 'https://bhavyafashions.com/wp-content/uploads/2026/07/Gemini_Generated_Image_m8id4fm8id4fm8id-Photoroom.png',
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
        product_image_url: 'https://bhavyafashions.com/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-25-at-11.57.12-AM-1.jpeg',
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

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes('placeholder') && !url.includes('your-project-id'));
}

export async function getAllInquiries(): Promise<Inquiry[]> {
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        const snap = await getDocs(collection(db, 'inquiries'));
        if (!snap.empty) {
          const list: Inquiry[] = [];
          snap.forEach((d) => list.push(d.data() as Inquiry));
          if (list.length > 0) {
            return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          }
        }
      }
    } catch {}
  }

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

  inMemoryInquiries.unshift(newInquiry);

  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        await setDoc(doc(db, 'inquiries', newInquiry.id), newInquiry, { merge: true });
      }
    } catch (err) {
      console.error('Failed to save inquiry to Firebase:', err);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      await supabase.from('inquiries').insert({
        reference_no: referenceNo,
        inquiry_type: newInquiry.inquiry_type,
        source_page: data.source_page,
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

    if (isFirebaseConfigured()) {
      try {
        const db = getFirebaseDb();
        if (db) {
          await setDoc(doc(db, 'inquiries', inquiry.id), {
            status,
            internal_notes: inquiry.internal_notes,
            updated_at: inquiry.updated_at,
          }, { merge: true });
        }
      } catch {}
    }

    return true;
  }
  return false;
}

export async function assignInquiryStaff(id: string, staffName: string): Promise<boolean> {
  const inquiry = inMemoryInquiries.find(i => i.id === id || i.reference_no === id);
  if (inquiry) {
    inquiry.assigned_staff = staffName;
    inquiry.updated_at = new Date().toISOString();

    if (isFirebaseConfigured()) {
      try {
        const db = getFirebaseDb();
        if (db) {
          await setDoc(doc(db, 'inquiries', inquiry.id), {
            assigned_staff: staffName,
            updated_at: inquiry.updated_at,
          }, { merge: true });
        }
      } catch {}
    }

    return true;
  }
  return false;
}
