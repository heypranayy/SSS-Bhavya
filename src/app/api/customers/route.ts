import { NextRequest, NextResponse } from 'next/server';
import { getAllCustomers, saveCustomer } from '@/lib/repository/catalogs';

export async function GET() {
  const customers = await getAllCustomers();
  return NextResponse.json({ customers });
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    if (!json.business_name || !json.business_name.trim()) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
    }

    const saved = await saveCustomer({
      id: json.id,
      business_name: json.business_name.trim(),
      contact_person: json.contact_person?.trim() || '',
      phone: json.phone?.trim() || '',
      email: json.email?.trim() || undefined,
      city: json.city?.trim() || 'Kolkata',
      state: json.state?.trim() || 'West Bengal',
      segment: json.segment?.trim() || 'Boutique',
      custom_price_tier: json.custom_price_tier || 'standard',
      discount_pct: Number(json.discount_pct) || 0,
    });

    return NextResponse.json({
      success: true,
      customer: saved,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save customer' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }
    const { deleteCustomer } = await import('@/lib/repository/catalogs');
    const success = await deleteCustomer(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete customer' }, { status: 500 });
  }
}
