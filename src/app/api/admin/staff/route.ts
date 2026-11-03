import { NextResponse } from 'next/server';
import {
  getStaffAccounts,
  saveStaffAccount,
  updateStaffAccount,
  deleteStaffAccount,
  StaffInput,
} from '@/lib/repository/staff';
import { getSessionStaff, readSessionCookie } from '@/lib/auth/session';

const MIN_PASSWORD_LENGTH = 8;

/** Only super admins and admins may change staff accounts. Returns an error response or null. */
async function requireStaffManager(req: Request): Promise<NextResponse | null> {
  const me = await getSessionStaff(readSessionCookie(req.headers.get('cookie')));
  if (!me) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  if (me.role !== 'super_admin' && me.role !== 'admin') {
    return NextResponse.json({ error: 'Only administrators can manage staff accounts' }, { status: 403 });
  }
  return null;
}

export async function GET() {
  try {
    return NextResponse.json(await getStaffAccounts());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const denied = await requireStaffManager(req);
    if (denied) return denied;

    const body = await req.json();
    const { name, email, password, role, hub } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }
    if (!password || String(password).trim().length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` }, { status: 400 });
    }

    const newStaff: StaffInput = {
      id: body.id || `staff-${Date.now()}`,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      password: String(password).trim(),
      role: role || 'sales_staff',
      hub: hub || 'Kolkata Barabazar',
      status: 'active',
      lastActive: 'Never',
    };

    const saved = await saveStaffAccount(newStaff);
    return NextResponse.json(saved, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const denied = await requireStaffManager(req);
    if (denied) return denied;

    const body = await req.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ error: 'id and updates are required' }, { status: 400 });
    }
    if (updates.password !== undefined && String(updates.password).trim().length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` }, { status: 400 });
    }

    const updated = await updateStaffAccount(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Staff account not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const denied = await requireStaffManager(req);
    if (denied) return denied;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Staff id is required' }, { status: 400 });
    }

    const success = await deleteStaffAccount(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
