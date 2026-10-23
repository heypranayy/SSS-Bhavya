import { NextResponse } from 'next/server';
import { verifyStaffCredentials } from '@/lib/repository/staff';

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

    const result = await verifyStaffCredentials(email, password);

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

    // Set HTTP cookie for authentication session
    response.cookies.set({
      name: 'bhavya_admin_auth',
      value: 'authenticated',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return response;
  } catch (err: any) {
    console.error('Admin login API error:', err);
    return NextResponse.json(
      { error: err.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
