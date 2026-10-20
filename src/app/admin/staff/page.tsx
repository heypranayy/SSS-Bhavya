import React from 'react';
import { StaffManager } from '@/components/admin/StaffManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Staff Management & Role Permissions | Bhavya Fashions Admin',
};

export default function AdminStaffPage() {
  return <StaffManager />;
}
