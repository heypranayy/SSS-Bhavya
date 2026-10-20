import { NextRequest, NextResponse } from 'next/server';
import { getAllBlogs, saveBlog, deleteBlog } from '@/lib/repository/blogs';

export async function GET() {
  const blogs = await getAllBlogs();
  return NextResponse.json({ blogs });
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    if (!json.title || !json.title.trim()) {
      return NextResponse.json({ error: 'Blog title is required' }, { status: 400 });
    }

    const saved = await saveBlog({
      id: json.id,
      title: json.title.trim(),
      slug: json.slug?.trim() || undefined,
      content: json.content || '',
      excerpt: json.excerpt?.trim() || undefined,
      category: json.category?.trim() || 'Ethnic Trends',
      author: json.author?.trim() || 'Bhavya Fashions Editorial',
      image_url: json.image_url || '/images/hero-trio-festive.jpg',
      date: json.date || new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      blog: saved,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save blog' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });
    }

    await deleteBlog(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete blog' }, { status: 500 });
  }
}
