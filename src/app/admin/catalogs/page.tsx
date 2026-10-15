import React from 'react';
import { getAllCatalogs } from '@/lib/repository/catalogs';
import { CatalogsListView } from '@/components/admin/CatalogsListView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Catalogs Management | Bhavya Fashions Admin',
};

export default async function AdminCatalogsPage() {
  const catalogs = await getAllCatalogs();

  return <CatalogsListView initialCatalogs={catalogs} />;
}
