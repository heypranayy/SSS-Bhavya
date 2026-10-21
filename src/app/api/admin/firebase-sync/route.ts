import { NextResponse } from 'next/server';
import { syncSeedDataToFirestore } from '@/lib/firebase/sync';
import { isFirebaseConfigured } from '@/lib/firebase/config';

export async function POST() {
  try {
    if (!isFirebaseConfigured()) {
      return NextResponse.json(
        { error: 'Firebase is not yet configured. Please add Firebase environment variables in .env.local or Vercel.' },
        { status: 400 }
      );
    }

    const result = await syncSeedDataToFirestore();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to sync to Firebase' },
      { status: 500 }
    );
  }
}
