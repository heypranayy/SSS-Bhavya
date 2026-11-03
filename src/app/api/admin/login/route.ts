import { NextResponse } from 'next/server';
import { verifyStaffCredentials } from '@/lib/repository/staff';
import { createSession, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await verifyStaffCredentials(String(email), String(password));

    if (!result.valid || !result.user) {
      return NextResponse.json(
        { error: 'Invalid credentials. Please check your email and password.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        hub: result.user.hub,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE,
      value: await createSession(result.user.id),
      path: '/',
      httpOnly: true,
      secure: new URL(req.url).protocol === 'https:',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (err: any) {
    console.error('Admin login API error:', err);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
