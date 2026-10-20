import { describe, it, expect } from 'vitest';
import {
  getAllCatalogs,
  saveCatalog,
  deleteCatalog,
  saveCustomer,
  deleteCustomer,
  getAllCustomers,
} from '../src/lib/repository/catalogs';
import {
  getAllInquiries,
  getInquiryById,
  createInquiry,
  updateInquiryStatus,
} from '../src/lib/repository/inquiries';

describe('New Admin Management Features (Delete Catalogs, Manual Inquiries, Customers & CSV)', () => {
  it('should create and permanently delete custom link catalogs', async () => {
    // Create temporary catalog
    const newCatalog = await saveCatalog({
      title: 'Temporary Test Catalog For Deletion',
      public_token: `test-del-${Date.now()}`,
      access_code: 'DEL999',
      mode: 'curated',
      status: 'active',
      overrides: [],
      presentation_settings: {
        priceDisplayMode: 'request',
        showPrices: false,
        layout: 'grid',
        columnsDesktop: 3,
        columnsMobile: 1,
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
    });

    expect(newCatalog).toBeDefined();
    expect(newCatalog.id).toBeDefined();

    const beforeCatalogs = await getAllCatalogs();
    expect(beforeCatalogs.some((c) => c.id === newCatalog.id)).toBe(true);

    // Delete the catalog
    const deleteSuccess = await deleteCatalog(newCatalog.id);
    expect(deleteSuccess).toBe(true);

    const afterCatalogs = await getAllCatalogs();
    expect(afterCatalogs.some((c) => c.id === newCatalog.id)).toBe(false);
  });

  it('should create and delete customers', async () => {
    const customer = await saveCustomer({
      business_name: 'Test Delete Boutique',
      contact_person: 'Pooja Agarwal',
      phone: '+91 98300 12345',
      city: 'Kolkata',
      segment: 'Boutique',
    });

    expect(customer).toBeDefined();
    const allBefore = await getAllCustomers();
    expect(allBefore.some((c) => c.id === customer.id)).toBe(true);

    const deleteSuccess = await deleteCustomer(customer.id);
    expect(deleteSuccess).toBe(true);

    const allAfter = await getAllCustomers();
    expect(allAfter.some((c) => c.id === customer.id)).toBe(false);
  });

  it('should record manual wholesale inquiries and update status', async () => {
    const inq = await createInquiry({
      inquiry_type: 'catalog',
      buyer_name: 'Sangeeta Mehta',
      business_name: 'Mehta Creations',
      phone: '+91 98450 77889',
      city: 'Bengaluru',
      state: 'Karnataka',
      source_page: '/admin/inquiries',
      items: [
        {
          product_id: 'p-migrated-29589',
          product_code: 'DN11059',
          product_title: 'Kesaria Silk Kurti',
          quoted_price: 1850,
          total_quantity: 12,
          indicative_subtotal: 22200,
          size_breakdown: { M: 4, L: 4, XL: 4 },
          notes: 'DN11059 manual sales order',
        },
      ],
    });

    expect(inq).toBeDefined();
    expect(inq.buyer_name).toBe('Sangeeta Mehta');
    expect(inq.status).toBe('new');

    const updatedSuccess = await updateInquiryStatus(inq.id, 'contacted', 'Quotation sent via WhatsApp desk');
    expect(updatedSuccess).toBe(true);

    const fetched = await getInquiryById(inq.id);
    expect(fetched?.status).toBe('contacted');
    expect(fetched?.internal_notes).toContain('Quotation sent');
  });

  it('should format inquiries into exportable CSV structure', async () => {
    const inquiries = await getAllInquiries();
    expect(inquiries.length).toBeGreaterThan(0);

    const headers = ['Reference_No', 'Type', 'Buyer_Name', 'Business_Name', 'Phone', 'City', 'State', 'Status'];
    const rows = inquiries.map((i) => [
      i.reference_no,
      i.inquiry_type || 'catalog',
      `"${i.buyer_name}"`,
      `"${i.business_name}"`,
      `"${i.phone}"`,
      `"${i.city || ''}"`,
      `"${i.state || ''}"`,
      i.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    expect(csvContent).toContain('Reference_No');
    expect(csvContent).toContain(inquiries[0].reference_no);
    expect(csvContent.length).toBeGreaterThan(100);
  });

  it('should edit an existing catalog and update properties without duplicating', async () => {
    const created = await saveCatalog({
      title: 'Original Title Before Edit',
      public_token: `edit-test-${Date.now()}`,
      mode: 'curated',
      status: 'active',
      access_code: 'CODE1',
    });

    expect(created.title).toBe('Original Title Before Edit');

    // Edit catalog
    const updated = await saveCatalog({
      id: created.id,
      title: 'Updated Lookbook Title After Edit',
      access_code: 'CODE2',
    });

    expect(updated.id).toBe(created.id);
    expect(updated.title).toBe('Updated Lookbook Title After Edit');
    expect(updated.access_code).toBe('CODE2');

    // Verify getAllCatalogs has only one catalog with this ID
    const all = await getAllCatalogs();
    const matching = all.filter((c) => c.id === created.id);
    expect(matching.length).toBe(1);
    expect(matching[0].title).toBe('Updated Lookbook Title After Edit');

    // Clean up
    await deleteCatalog(created.id);
  });

  it('should create, edit and permanently delete products without duplicates', async () => {
    const { saveProduct, deleteProduct, getAllProducts, getProductById } = await import('../src/lib/repository/products');

    // Create a product
    const created = await saveProduct({
      title: 'Original Test Design 2026',
      code: `TEST-${Date.now()}`,
      fabric: 'Pure Cotton',
      color: 'Pastel Peach',
      base_wholesale_price: 650,
      moq: 6,
      price_on_enquiry: true,
    });

    expect(created.id).toBeDefined();
    expect(created.title).toBe('Original Test Design 2026');
    expect(created.price_on_enquiry).toBe(true);

    const allBefore = await getAllProducts();
    expect(allBefore.some((p) => p.id === created.id)).toBe(true);

    // Edit the product
    const edited = await saveProduct({
      id: created.id,
      title: 'Updated Test Design 2026 Modified',
      fabric: 'Muslin Silk',
      base_wholesale_price: 750,
      moq: 12,
      price_on_enquiry: true,
    });

    expect(edited.id).toBe(created.id);
    expect(edited.title).toBe('Updated Test Design 2026 Modified');
    expect(edited.fabric).toBe('Muslin Silk');

    const allAfterEdit = await getAllProducts();
    const matching = allAfterEdit.filter((p) => p.id === created.id);
    expect(matching.length).toBe(1);
    expect(matching[0].title).toBe('Updated Test Design 2026 Modified');

    // Delete the product
    const deleteSuccess = await deleteProduct(created.id);
    expect(deleteSuccess).toBe(true);

    const allAfterDelete = await getAllProducts();
    expect(allAfterDelete.some((p) => p.id === created.id)).toBe(false);

    const directLookup = await getProductById(created.id);
    expect(directLookup).toBeNull();
  });

  it('should default price_on_enquiry to true for all wholesale products', async () => {
    const { getAllProducts } = await import('../src/lib/repository/products');
    const products = await getAllProducts();
    expect(products.length).toBeGreaterThan(0);

    // Verify all active products have price_on_enquiry defaulted to true
    for (const p of products) {
      expect(p.price_on_enquiry).not.toBe(false);
      expect(p.price_display_mode).toBe('request');
    }
  });
});


