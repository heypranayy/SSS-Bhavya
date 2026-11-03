import { getDb, listDocs } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { deleteSessionsForStaff } from '@/lib/auth/session';

export type StaffRole = 'super_admin' | 'admin' | 'catalog_manager' | 'sales_staff' | 'read_only';

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  hub: 'Kolkata Barabazar' | 'Surat Unit' | 'All Hubs';
  status: 'active' | 'suspended';
  lastActive?: string;
  created_at?: string;
  updated_at?: string;
}

/** A staff account as written by the admin UI; `password` is plain text and only ever hashed. */
export type StaffInput = StaffAccount & { password?: string };

function stripPassword<T extends { password?: string }>(account: T): Omit<T, 'password'> {
  const { password: _ignored, ...rest } = account;
  return rest;
}

export async function getStaffAccounts(): Promise<StaffAccount[]> {
  return listDocs<StaffAccount>('staff', 'created_at DESC');
}

export async function getStaffById(id: string): Promise<StaffAccount | null> {
  const row = await getDb().prepare('SELECT data FROM staff WHERE id = ?').bind(id).first<{ data: string }>();
  return row ? (JSON.parse(row.data) as StaffAccount) : null;
}

export async function saveStaffAccount(input: StaffInput): Promise<StaffAccount> {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  const existing = await db
    .prepare('SELECT id, data, password_hash FROM staff WHERE id = ? OR email = ?')
    .bind(input.id, email)
    .first<{ id: string; data: string; password_hash: string | null }>();

  const now = new Date().toISOString();
  const account: StaffAccount = {
    ...(existing ? (JSON.parse(existing.data) as StaffAccount) : {}),
    ...stripPassword(input),
    id: existing?.id || input.id,
    email,
    created_at: input.created_at || (existing ? (JSON.parse(existing.data) as StaffAccount).created_at : now) || now,
    updated_at: now,
  };
  const passwordHash = input.password ? await hashPassword(input.password.trim()) : existing?.password_hash ?? null;

  await db
    .prepare(
      `INSERT INTO staff (id, email, password_hash, role, status, created_at, updated_at, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET email = excluded.email, password_hash = excluded.password_hash,
         role = excluded.role, status = excluded.status, updated_at = excluded.updated_at, data = excluded.data`
    )
    .bind(account.id, email, passwordHash, account.role, account.status, account.created_at, now, JSON.stringify(account))
    .run();

  return account;
}

export async function updateStaffAccount(
  id: string,
  updates: Partial<StaffAccount> & { password?: string }
): Promise<StaffAccount | null> {
  const current = await getStaffById(id);
  if (!current) return null;
  const saved = await saveStaffAccount({ ...current, ...updates, id });
  if (updates.password || updates.status === 'suspended') {
    await deleteSessionsForStaff(id);
  }
  return saved;
}

export async function deleteStaffAccount(id: string): Promise<boolean> {
  const db = getDb();
  const res = await db.batch([
    db.prepare('DELETE FROM sessions WHERE staff_id = ?').bind(id),
    db.prepare('DELETE FROM staff WHERE id = ?').bind(id),
  ]);
  return (res[1].meta.changes ?? 0) > 0;
}

/** Checks an email/password pair against the hashed passwords in D1. */
export async function verifyStaffCredentials(
  email: string,
  pass: string
): Promise<{ valid: boolean; user?: StaffAccount; reason?: string }> {
  const row = await getDb()
    .prepare('SELECT data, password_hash, status FROM staff WHERE email = ?')
    .bind(email.trim().toLowerCase())
    .first<{ data: string; password_hash: string | null; status: string }>();

  if (!row) {
    // Spend the same time as a real check so response timing does not reveal which emails exist.
    await verifyPassword(pass, 'pbkdf2-sha256$100000$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=');
    return { valid: false, reason: 'Account not found' };
  }
  if (!(await verifyPassword(pass.trim(), row.password_hash))) {
    return { valid: false, reason: 'Invalid password' };
  }
  if (row.status === 'suspended') {
    return { valid: false, reason: 'Account suspended' };
  }

  const user = JSON.parse(row.data) as StaffAccount;
  const lastActive = new Date().toISOString();
  await getDb()
    .prepare('UPDATE staff SET data = json_set(data, \'$.lastActive\', ?) WHERE id = ?')
    .bind(lastActive, user.id)
    .run();
  return { valid: true, user: { ...user, lastActive } };
}
