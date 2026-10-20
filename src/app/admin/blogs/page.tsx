import React from 'react';
import { getAllBlogs } from '@/lib/repository/blogs';
import { AdminBlogsManager } from '@/components/admin/AdminBlogsManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Blog Posts & Articles | Bhavya Fashions Admin',
};

export default async function AdminBlogsPage() {
  const blogs = await getAllBlogs();

  return <AdminBlogsManager initialBlogs={blogs} />;
}
