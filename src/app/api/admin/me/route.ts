import { NextResponse } from 'next/server';
import { getSessionStaff, readSessionCookie } from '@/lib/auth/session';

/** The signed-in staff member, used by the admin layout. */
export async function GET(req: Request) {
  const user = await getSessionStaff(readSessionCookie(req.headers.get('cookie')));
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, hub: user.hub },
  });
}
