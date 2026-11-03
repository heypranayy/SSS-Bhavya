import { NextResponse } from 'next/server';
import { deleteSession, readSessionCookie, SESSION_COOKIE } from '@/lib/auth/session';

export async function POST(req: Request) {
  await deleteSession(readSessionCookie(req.headers.get('cookie')));
  const response = NextResponse.json({ success: true });
  response.cookies.set({ name: SESSION_COOKIE, value: '', path: '/', httpOnly: true, maxAge: 0 });
  return response;
}
