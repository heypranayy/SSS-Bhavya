import { NextRequest, NextResponse } from 'next/server';
import { getAllCatalogs } from '@/lib/repository/catalogs';

// Rate limiting in-memory store (IP -> { count, lastAttempt })
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 1000 }); // 1 min window
    return true;
  }

  if (entry.count >= 10) {
    return false; // Exceeded 10 attempts per minute
  }

  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many catalogue verification attempts. Please wait a minute before trying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const rawCode = (body?.code || '').trim();

    if (!rawCode) {
      return NextResponse.json(
        { error: 'Please enter a valid wholesale catalogue code.' },
        { status: 400 }
      );
    }

    const catalogs = await getAllCatalogs();
    const normalized = rawCode.toLowerCase();

    // Look for matching access_code or public_token
    const catalog = catalogs.find((c) => {
      const matchAccess = c.access_code && c.access_code.toLowerCase() === normalized;
      const matchToken = c.public_token && c.public_token.toLowerCase() === normalized;
      return matchAccess || matchToken;
    });

    if (!catalog) {
      return NextResponse.json(
        { error: 'Invalid catalogue code. Please verify the code received from your Bhavya Fashions sales representative or contact us on WhatsApp.' },
        { status: 404 }
      );
    }

    // Check Revoked status
    if (catalog.status === 'revoked') {
      return NextResponse.json(
        { error: 'This wholesale catalogue has been revoked by Bhavya Fashions. Please contact our sales desk for an updated active link.' },
        { status: 403 }
      );
    }

    // Check Expired status
    if (
      catalog.status === 'expired' ||
      (catalog.expires_at && new Date(catalog.expires_at) < new Date())
    ) {
      const expDate = catalog.expires_at
        ? new Date(catalog.expires_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : 'recently';
      return NextResponse.json(
        { error: `This wholesale catalogue expired on ${expDate}. Please contact us on WhatsApp to receive the renewed catalogue.` },
        { status: 410 }
      );
    }

    if (catalog.status !== 'active') {
      return NextResponse.json(
        { error: 'This catalogue is not yet active. Please check back shortly.' },
        { status: 403 }
      );
    }

    // Success: return redirect URL
    return NextResponse.json({
      success: true,
      catalogTitle: catalog.title,
      redirectUrl: `/catalog/${catalog.public_token}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Server error verifying catalogue code. Please try again.' },
      { status: 500 }
    );
  }
}
