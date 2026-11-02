import { describe, it, expect } from 'vitest';
import { getAllProducts, saveProduct, deleteProduct, deleteProducts } from '@/lib/repository/products';

describe('Product deletion, bulk deletion, and newest-first ordering', () => {
  it('should place the latest added product at the first position of getAllProducts', async () => {
    const timestamp = Date.now();
    const newProduct1 = await saveProduct({
      title: `Latest Kurti Design 1 ${timestamp}`,
      code: `BF-NEW-1-${timestamp}`,
      category_id: 'cat-3p-kurtis',
      fabric: 'Pure Muslin 100%',
      base_wholesale_price: 650,
    });

    // Small delay to ensure timestamp difference
    await new Promise((r) => setTimeout(r, 20));

    const newProduct2 = await saveProduct({
      title: `Latest Kurti Design 2 ${timestamp}`,
      code: `BF-NEW-2-${timestamp}`,
      category_id: 'cat-3p-kurtis',
      fabric: 'Kesaria Silk',
      base_wholesale_price: 799,
    });

    const all = await getAllProducts();
    expect(all.length).toBeGreaterThan(0);

    // The last added product must come first!
    expect(all[0].id).toBe(newProduct2.id);
    expect(all[0].code).toBe(newProduct2.code);

    // Cleanup
    await deleteProducts([newProduct1.id, newProduct2.id]);
  });

  it('should delete a product cleanly so it disappears from getAllProducts', async () => {
    const timestamp = Date.now();
    const prod = await saveProduct({
      title: `To Be Deleted ${timestamp}`,
      code: `BF-DEL-${timestamp}`,
      category_id: 'cat-2p-kurtis',
      base_wholesale_price: 499,
    });

    let all = await getAllProducts();
    expect(all.some((p) => p.id === prod.id || p.code === prod.code)).toBe(true);

    const success = await deleteProduct(prod.id);
    expect(success).toBe(true);

    all = await getAllProducts();
    expect(all.some((p) => p.id === prod.id || p.code === prod.code)).toBe(false);
  });

  it('should bulk delete multiple products at once', async () => {
    const timestamp = Date.now();
    const p1 = await saveProduct({
      title: `Bulk Del 1 ${timestamp}`,
      code: `BF-BDEL-1-${timestamp}`,
      category_id: 'cat-coord-sets',
    });
    const p2 = await saveProduct({
      title: `Bulk Del 2 ${timestamp}`,
      code: `BF-BDEL-2-${timestamp}`,
      category_id: 'cat-coord-sets',
    });
    const p3 = await saveProduct({
      title: `Bulk Del 3 ${timestamp}`,
      code: `BF-BDEL-3-${timestamp}`,
      category_id: 'cat-coord-sets',
    });

    let all = await getAllProducts();
    expect(all.some((p) => p.id === p1.id)).toBe(true);
    expect(all.some((p) => p.id === p2.id)).toBe(true);
    expect(all.some((p) => p.id === p3.id)).toBe(true);

    const result = await deleteProducts([p1.id, p2.id, p3.id]);
    expect(result.success).toBe(true);
    expect(result.deletedCount).toBe(3);

    all = await getAllProducts();
    expect(all.some((p) => p.id === p1.id)).toBe(false);
    expect(all.some((p) => p.id === p2.id)).toBe(false);
    expect(all.some((p) => p.id === p3.id)).toBe(false);
  });
});
