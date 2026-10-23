import { NextResponse } from 'next/server';
import {
  getStaffAccounts,
  saveStaffAccount,
  updateStaffAccount,
  deleteStaffAccount,
  StaffAccount,
} from '@/lib/repository/staff';

export async function GET() {
  try {
    const list = await getStaffAccounts();
    // Return staff accounts with password sanitized for client view
    const safeList = list.map((s) => ({
      ...s,
      hasPassword: Boolean(s.password),
    }));
    return NextResponse.json(safeList);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role, hub } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const newStaff: StaffAccount = {
      id: body.id || `staff-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: (password || 'Bhavya@2026').trim(),
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
    const body = await req.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ error: 'id and updates are required' }, { status: 400 });
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
