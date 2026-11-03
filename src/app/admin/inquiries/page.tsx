import React from 'react';
import { getAllInquiries } from '@/lib/repository/inquiries';
import { InquiriesManager } from '@/components/admin/InquiriesManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Wholesale Inquiries Management | Bhavya Fashions Admin',
};

export default async function AdminInquiriesPage() {
  const inquiries = await getAllInquiries();

  return <InquiriesManager initialInquiries={inquiries} />;
}
