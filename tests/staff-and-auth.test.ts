import { describe, it, expect, beforeAll } from 'vitest';
import {
  getStaffAccounts,
  saveStaffAccount,
  updateStaffAccount,
  deleteStaffAccount,
  verifyStaffCredentials,
} from '../src/lib/repository/staff';
import { hashPassword, verifyPassword } from '../src/lib/auth/password';
import { createSession, deleteSession, getSessionStaff, readSessionCookie } from '../src/lib/auth/session';
import { accessRuleFor } from '../src/lib/auth/access';
import { getDb } from '../src/lib/db';

describe('Password hashing (PBKDF2 / WebCrypto)', () => {
  it('hashes with a random salt and verifies only the right password', async () => {
    const a = await hashPassword('Correct Horse 42');
    const b = await hashPassword('Correct Horse 42');
    expect(a).toMatch(/^pbkdf2-sha256\$100000\$/);
    expect(a).not.toBe(b);
    expect(await verifyPassword('Correct Horse 42', a)).toBe(true);
    expect(await verifyPassword('correct horse 42', a)).toBe(false);
    expect(await verifyPassword('anything', null)).toBe(false);
    expect(await verifyPassword('anything', 'plain-text-password')).toBe(false);
  });
});

describe('Staff Repository & Admin Authentication', () => {
  beforeAll(async () => {
    await saveStaffAccount({
      id: 'staff-super-1',
      name: 'Super Administrator',
      email: 'SSS@bhavyafashions.com',
      password: 'Test-Admin-Pass-1',
      role: 'super_admin',
      hub: 'All Hubs',
      status: 'active',
    });
  });

  it('verifies a stored account against its hashed password (email is case-insensitive)', async () => {
    const res = await verifyStaffCredentials('sss@BhavyaFashions.com', 'Test-Admin-Pass-1');
    expect(res.valid).toBe(true);
    expect(res.user?.role).toBe('super_admin');
    expect(res.user).not.toHaveProperty('password');
  });

  it('never stores the plain-text password', async () => {
    const row = await getDb()
      .prepare('SELECT password_hash, data FROM staff WHERE id = ?')
      .bind('staff-super-1')
      .first<{ password_hash: string; data: string }>();
    expect(row?.password_hash).toMatch(/^pbkdf2-sha256\$/);
    expect(row?.data).not.toContain('Test-Admin-Pass-1');
    expect(JSON.parse(row!.data)).not.toHaveProperty('password');
  });

  it('rejects the old hard-coded master passwords and wrong passwords', async () => {
    for (const [email, pass] of [
      ['sss@bhavyafashions.com', 'Bhavya@2026'],
      ['pranay@gexart.com', 'Gexart@2026'],
      ['admin@bhavyafashions.com', 'bhavya2026admin'],
      ['sss@bhavyafashions.com', 'WrongPassword123'],
      ['unknown-user@example.com', 'SomePassword'],
    ]) {
      expect((await verifyStaffCredentials(email, pass)).valid).toBe(false);
    }
  });

  it('should create, retrieve, update, and delete a custom staff account', async () => {
    const testId = `staff-test-${Date.now()}`;
    await saveStaffAccount({
      id: testId,
      name: 'Test Sales Rep',
      email: `${testId}@bhavyafashions.com`,
      password: 'CustomSecurePass@123',
      role: 'sales_staff',
      hub: 'Kolkata Barabazar',
      status: 'active',
    });

    const found = (await getStaffAccounts()).find((s) => s.id === testId);
    expect(found).toBeDefined();
    expect(found?.name).toBe('Test Sales Rep');
    expect(found).not.toHaveProperty('password');

    const authRes = await verifyStaffCredentials(`${testId}@bhavyafashions.com`, 'CustomSecurePass@123');
    expect(authRes.valid).toBe(true);
    expect(authRes.user?.id).toBe(testId);

    // Role change keeps the password
    await updateStaffAccount(testId, { role: 'catalog_manager' });
    const updated = (await getStaffAccounts()).find((s) => s.id === testId);
    expect(updated?.role).toBe('catalog_manager');
    expect((await verifyStaffCredentials(`${testId}@bhavyafashions.com`, 'CustomSecurePass@123')).valid).toBe(true);

    // Password change replaces it
    await updateStaffAccount(testId, { password: 'BrandNewPass#456' });
    expect((await verifyStaffCredentials(`${testId}@bhavyafashions.com`, 'CustomSecurePass@123')).valid).toBe(false);
    expect((await verifyStaffCredentials(`${testId}@bhavyafashions.com`, 'BrandNewPass#456')).valid).toBe(true);

    // Suspended accounts cannot sign in
    await updateStaffAccount(testId, { status: 'suspended' });
    expect((await verifyStaffCredentials(`${testId}@bhavyafashions.com`, 'BrandNewPass#456')).valid).toBe(false);

    expect(await deleteStaffAccount(testId)).toBe(true);
    expect((await getStaffAccounts()).find((s) => s.id === testId)).toBeUndefined();
  });
});

describe('Admin sessions', () => {
  it('creates a session for a staff member, resolves it, and revokes it', async () => {
    const token = await createSession('staff-super-1');
    expect(token.length).toBeGreaterThan(30);

    // Only the SHA-256 of the token is stored
    const stored = await getDb().prepare('SELECT id FROM sessions').all<{ id: string }>();
    expect(stored.results.some((r) => r.id === token)).toBe(false);

    expect((await getSessionStaff(token))?.email).toBe('sss@bhavyafashions.com');
    expect(await getSessionStaff('forged-token')).toBeNull();
    expect(readSessionCookie(`a=1; bhavya_session=${token}; b=2`)).toBe(token);

    await deleteSession(token);
    expect(await getSessionStaff(token)).toBeNull();
  });

  it('ends sessions when an account is suspended', async () => {
    const token = await createSession('staff-super-1');
    await updateStaffAccount('staff-super-1', { status: 'suspended' });
    expect(await getSessionStaff(token)).toBeNull();
    await updateStaffAccount('staff-super-1', { status: 'active' });
  });
});

describe('Proxy access rules', () => {
  it('protects admin pages and admin/write APIs, leaves buyer-facing endpoints public', () => {
    expect(accessRuleFor('/admin', 'GET')).toBe('page');
    expect(accessRuleFor('/admin/products', 'GET')).toBe('page');
    expect(accessRuleFor('/admin/login', 'GET')).toBeNull();
    expect(accessRuleFor('/api/admin/login', 'POST')).toBeNull();
    expect(accessRuleFor('/api/admin/staff', 'GET')).toBe('api');
    expect(accessRuleFor('/api/upload', 'POST')).toBe('api');
    expect(accessRuleFor('/api/products/create', 'POST')).toBe('api');
    expect(accessRuleFor('/api/customers', 'GET')).toBe('api');
    expect(accessRuleFor('/api/inquiries', 'GET')).toBe('api');
    expect(accessRuleFor('/api/inquiries', 'POST')).toBeNull();
    expect(accessRuleFor('/api/blogs', 'GET')).toBeNull();
    expect(accessRuleFor('/api/blogs', 'POST')).toBe('api');
    expect(accessRuleFor('/api/catalog/verify-code', 'POST')).toBeNull();
    expect(accessRuleFor('/products', 'GET')).toBeNull();
    expect(accessRuleFor('/media/uploads/x.webp', 'GET')).toBeNull();
  });
});
