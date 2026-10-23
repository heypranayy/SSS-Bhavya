import { describe, it, expect } from 'vitest';
import {
  getStaffAccounts,
  saveStaffAccount,
  updateStaffAccount,
  deleteStaffAccount,
  verifyStaffCredentials,
} from '../src/lib/repository/staff';

describe('Staff Repository & Admin Authentication', () => {
  it('should verify master super admin credentials for Bhavya and Pranay (Gexart)', async () => {
    // Bhavya super admin
    const bhavyaRes = await verifyStaffCredentials('sss@bhavyafashions.com', 'Bhavya@2026');
    expect(bhavyaRes.valid).toBe(true);
    expect(bhavyaRes.user?.role).toBe('super_admin');

    // Pranay Gexart lead admin
    const pranayRes = await verifyStaffCredentials('pranay@gexart.com', 'Bhavya@2026');
    expect(pranayRes.valid).toBe(true);
    expect(pranayRes.user?.email).toBe('pranay@gexart.com');
    expect(pranayRes.user?.role).toBe('super_admin');

    // Alternative master passwords
    const pranayAlt = await verifyStaffCredentials('pranay@gexart.com', 'bhavya2026');
    expect(pranayAlt.valid).toBe(true);

    const pranayGexartPass = await verifyStaffCredentials('pranay@gexart.com', 'Gexart@2026');
    expect(pranayGexartPass.valid).toBe(true);
  });

  it('should reject invalid passwords for existing and non-existing accounts', async () => {
    const wrongPass = await verifyStaffCredentials('sss@bhavyafashions.com', 'WrongPassword123');
    expect(wrongPass.valid).toBe(false);

    const nonExistent = await verifyStaffCredentials('unknown-user@example.com', 'SomePassword');
    expect(nonExistent.valid).toBe(false);
  });

  it('should create, retrieve, update, and delete a custom staff account', async () => {
    const testId = `staff-test-${Date.now()}`;
    const newStaff = {
      id: testId,
      name: 'Test Sales Rep',
      email: `${testId}@bhavyafashions.com`,
      password: 'CustomSecurePass@123',
      role: 'sales_staff' as const,
      hub: 'Kolkata Barabazar' as const,
      status: 'active' as const,
    };

    await saveStaffAccount(newStaff);

    // Verify retrieval
    const staffList = await getStaffAccounts();
    const found = staffList.find((s) => s.id === testId);
    expect(found).toBeDefined();
    expect(found?.name).toBe('Test Sales Rep');

    // Verify login with custom credentials
    const authRes = await verifyStaffCredentials(`${testId}@bhavyafashions.com`, 'CustomSecurePass@123');
    expect(authRes.valid).toBe(true);
    expect(authRes.user?.id).toBe(testId);

    // Update staff role
    await updateStaffAccount(testId, { role: 'catalog_manager' });
    const updatedList = await getStaffAccounts();
    const updated = updatedList.find((s) => s.id === testId);
    expect(updated?.role).toBe('catalog_manager');

    // Delete staff
    const deleted = await deleteStaffAccount(testId);
    expect(deleted).toBe(true);

    const postDeleteList = await getStaffAccounts();
    expect(postDeleteList.find((s) => s.id === testId)).toBeUndefined();
  });
});
