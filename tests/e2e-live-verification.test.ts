import { describe, it, expect, beforeAll } from 'vitest';
import { sanitizeForFirestore, isFirebaseConfigured, getFirebaseDb } from '@/lib/firebase/config';
import {
  getAllInquiries,
  createInquiry,
  getInquiryById,
  updateInquiryStatus,
  assignInquiryStaff,
  deleteInquiry,
} from '@/lib/repository/inquiries';
import {
  getAllProducts,
  saveProduct,
  getProductById,
  getProductBySlug,
  deleteProduct,
} from '@/lib/repository/products';

describe('E2E Live Verification: Enquiries, Products, and Firestore Sanitization', () => {
  beforeAll(() => {
    // Ensure env variables are present
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'sss-bhavya';
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'AIzaSyBEB5pdqKkkqpp9EZUvrgRiwH7Hk32R2PQ';
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'sss-bhavya.firebaseapp.com';
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'sss-bhavya.firebasestorage.app';
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '992742433154';
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:992742433154:web:db338b3f268d444a966f9b';
    }
  });

  describe('Firestore Sanitizer Engine', () => {
    it('removes undefined values from simple and deeply nested objects', () => {
      const rawPayload = {
        id: 'test-123',
        title: 'Kurti Set',
        description: undefined,
        optionalField: undefined,
        price: 850,
        metadata: {
          tag: 'summer',
          secondaryTag: undefined,
          deep: {
            valid: true,
            invalid: undefined,
          },
        },
        items: [
          { name: 'Item 1', note: undefined, qty: 10 },
          { name: 'Item 2', note: 'urgent', qty: 5 },
        ],
      };

      const sanitized = sanitizeForFirestore(rawPayload);

      expect(sanitized).toHaveProperty('id', 'test-123');
      expect(sanitized).toHaveProperty('title', 'Kurti Set');
      expect(sanitized).not.toHaveProperty('description');
      expect(sanitized).not.toHaveProperty('optionalField');
      expect(sanitized.metadata).not.toHaveProperty('secondaryTag');
      expect(sanitized.metadata.deep).not.toHaveProperty('invalid');
      expect(sanitized.metadata.deep.valid).toBe(true);
      expect(sanitized.items[0]).not.toHaveProperty('note');
      expect(sanitized.items[0].qty).toBe(10);
      expect(sanitized.items[1].note).toBe('urgent');
    });
  });

  describe('Wholesale Enquiries Workflow', () => {
    let testInquiryId = '';

    it('creates an inquiry with undefined and optional fields without Firestore errors', async () => {
      const created = await createInquiry({
        inquiry_type: 'website',
        buyer_name: 'Priya Sharma (Test Buyer)',
        business_name: 'Priya Ethnic Boutiques',
        phone: '+91 98311 00000',
        email: undefined as any,
        city: undefined as any,
        state: undefined as any,
        message: 'Looking for 200 pcs 3-piece muslin sets for summer catalog display',
        items: [],
      });

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.reference_no).toMatch(/^BF-WEB-\d+$/);
      expect(created.status).toBe('new');
      testInquiryId = created.id;
    });

    it('retrieves the created inquiry in getAllInquiries()', async () => {
      const all = await getAllInquiries();
      expect(all.length).toBeGreaterThan(0);
      const found = all.find(i => i.id === testInquiryId);
      expect(found).toBeDefined();
      expect(found?.buyer_name).toBe('Priya Sharma (Test Buyer)');
      expect(found?.business_name).toBe('Priya Ethnic Boutiques');
    });

    it('fetches the inquiry by ID and reference number', async () => {
      const inq = await getInquiryById(testInquiryId);
      expect(inq).toBeDefined();
      expect(inq?.id).toBe(testInquiryId);

      if (inq?.reference_no) {
        const inqByRef = await getInquiryById(inq.reference_no);
        expect(inqByRef).toBeDefined();
        expect(inqByRef?.id).toBe(testInquiryId);
      }
    });

    it('updates inquiry status and internal notes', async () => {
      const updated = await updateInquiryStatus(testInquiryId, 'contacted', 'WhatsApp lookbook sent to client');
      expect(updated).toBe(true);

      const inq = await getInquiryById(testInquiryId);
      expect(inq?.status).toBe('contacted');
      expect(inq?.internal_notes).toBe('WhatsApp lookbook sent to client');
    });

    it('assigns staff to the inquiry', async () => {
      const assigned = await assignInquiryStaff(testInquiryId, 'Amit Verma (Kolkata Sales)');
      expect(assigned).toBe(true);

      const inq = await getInquiryById(testInquiryId);
      expect(inq?.assigned_staff).toBe('Amit Verma (Kolkata Sales)');
    });

    it('creates a price_request inquiry with single design item', async () => {
      const priceReq = await createInquiry({
        inquiry_type: 'price_request',
        buyer_name: 'Anita Roy',
        business_name: 'Roy Sarees',
        phone: '+91 98300 11111',
        source_page: '/products',
        items: [
          {
            id: 'item-1',
            product_id: 'p-migrated-29589',
            product_code: 'DN11059',
            product_title: '11059 Kurti Pant Dupatta',
            quoted_price: 0,
            size_breakdown: { L: 6, XL: 6 },
            total_quantity: 12,
            indicative_subtotal: 0,
            notes: 'Price on Request Quotation',
          },
        ],
      });

      expect(priceReq.reference_no).toMatch(/^BF-REQ-\d+$/);
      expect(priceReq.items.length).toBe(1);

      // Clean up price request
      await deleteInquiry(priceReq.id);
    });

    it('cleans up test inquiry via deleteInquiry', async () => {
      const deleted = await deleteInquiry(testInquiryId);
      expect(deleted).toBe(true);

      const all = await getAllInquiries();
      expect(all.some(i => i.id === testInquiryId)).toBe(false);
    });
  });

  describe('Frontend Product Retrieval & Management Workflow', () => {
    let testProductId = '';
    const testCode = `BF-TEST-${Date.now()}`;

    it('saves a new product with undefined optional fields and ensures price_on_enquiry', async () => {
      const newProduct = await saveProduct({
        code: testCode,
        title: 'Test Royal Festive Muslin Kurti',
        fabric: 'Pure Muslin 100%',
        color: 'Pastel Peach',
        style_type: '3-Piece Kurti Pant Dupatta',
        description: undefined,
        base_wholesale_price: 795,
        moq: 6,
        stock_status: 'in_stock',
        is_active: true,
      });

      expect(newProduct).toBeDefined();
      expect(newProduct.id).toBeDefined();
      expect(newProduct.code).toBe(testCode);
      expect(newProduct.price_on_enquiry).toBe(true);
      expect(newProduct.price_display_mode).toBe('request');
      testProductId = newProduct.id;
    });

    it('returns the newly created product in getAllProducts()', async () => {
      const products = await getAllProducts();
      expect(products.length).toBeGreaterThan(0);
      const found = products.find(p => p.id === testProductId || p.code === testCode);
      expect(found).toBeDefined();
      expect(found?.title).toBe('Test Royal Festive Muslin Kurti');
      expect(found?.fabric).toBe('Pure Muslin 100%');
    });

    it('looks up the product by ID and by slug', async () => {
      const productById = await getProductById(testProductId);
      expect(productById).toBeDefined();
      expect(productById?.code).toBe(testCode);

      if (productById?.slug) {
        const productBySlug = await getProductBySlug(productById.slug);
        expect(productBySlug).toBeDefined();
        expect(productBySlug?.id).toBe(testProductId);
      }
    });

    it('updates the product without creating duplicates', async () => {
      const updated = await saveProduct({
        id: testProductId,
        code: testCode,
        title: 'Updated Royal Festive Muslin Kurti',
        fabric: 'Chanderi Muslin Silk',
      });

      expect(updated.title).toBe('Updated Royal Festive Muslin Kurti');
      expect(updated.fabric).toBe('Chanderi Muslin Silk');

      const all = await getAllProducts();
      const occurrences = all.filter(p => p.id === testProductId);
      expect(occurrences.length).toBe(1);
    });

    it('deletes the product cleanly', async () => {
      const deleted = await deleteProduct(testProductId);
      expect(deleted).toBe(true);

      const all = await getAllProducts();
      expect(all.some(p => p.id === testProductId || p.code === testCode)).toBe(false);
    });
  });
});
