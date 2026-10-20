import React from 'react';
import { getAllCustomers } from '@/lib/repository/catalogs';
import { AdminCustomersManager } from '@/components/admin/AdminCustomersManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Customer Profiles & Price Lists | Bhavya Fashions Admin',
};

export default async function AdminCustomersPage() {
  const customers = await getAllCustomers();

  return <AdminCustomersManager initialCustomers={customers} />;
}
