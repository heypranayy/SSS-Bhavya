import { getDb } from '@/lib/db';
import type { StaffAccount } from '@/lib/repository/staff';

export const SESSION_COOKIE = 'bhavya_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Creates a session row and returns the raw token to put in the HttpOnly cookie. */
export async function createSession(staffId: string): Promise<string> {
  const token = randomToken();
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_MAX_AGE_SECONDS * 1000);
  const db = getDb();
  await db.batch([
    db.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now.toISOString()),
    db
      .prepare('INSERT INTO sessions (id, staff_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
      .bind(await sha256Hex(token), staffId, now.toISOString(), expires.toISOString()),
  ]);
  return token;
}

/** Returns the signed-in, active staff member for a session token, or null. */
export async function getSessionStaff(token: string | undefined | null): Promise<StaffAccount | null> {
  if (!token) return null;
  const row = await getDb()
    .prepare(
      `SELECT staff.data AS data FROM sessions JOIN staff ON staff.id = sessions.staff_id
       WHERE sessions.id = ? AND sessions.expires_at > ? AND staff.status = 'active'`
    )
    .bind(await sha256Hex(token), new Date().toISOString())
    .first<{ data: string }>();
  return row ? (JSON.parse(row.data) as StaffAccount) : null;
}

export async function deleteSession(token: string | undefined | null): Promise<void> {
  if (!token) return;
  await getDb().prepare('DELETE FROM sessions WHERE id = ?').bind(await sha256Hex(token)).run();
}

export async function deleteSessionsForStaff(staffId: string): Promise<void> {
  await getDb().prepare('DELETE FROM sessions WHERE staff_id = ?').bind(staffId).run();
}

export function readSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === SESSION_COOKIE) return decodeURIComponent(rest.join('='));
  }
  return null;
}
