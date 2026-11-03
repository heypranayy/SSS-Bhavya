import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { accessRuleFor } from '@/lib/auth/access';
import { getSessionStaff, SESSION_COOKIE } from '@/lib/auth/session';

/** Guards the admin pages and every non-public API with the D1-backed staff session. */
export async function proxy(request: NextRequest) {
  const rule = accessRuleFor(request.nextUrl.pathname, request.method);
  if (!rule) return NextResponse.next();

  const staff = await getSessionStaff(request.cookies.get(SESSION_COOKIE)?.value);
  if (staff) return NextResponse.next();

  if (rule === 'api') {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  const login = new URL('/admin/login', request.url);
  login.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
