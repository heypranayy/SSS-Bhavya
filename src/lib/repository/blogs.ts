import { deleteDocs, findDoc, getDoc, listDocs, putDoc } from '@/lib/db';
import { blogColumns } from '@/lib/db/rows';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  date: string;
  link?: string;
  image_url?: string;
  author?: string;
  category?: string;
}

export async function getAllBlogs(): Promise<BlogPost[]> {
  return listDocs<BlogPost>('blogs', 'date DESC');
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  return findDoc<BlogPost>('blogs', 'slug', slug);
}

export async function saveBlog(blogData: Partial<BlogPost>): Promise<BlogPost> {
  if (blogData.id) {
    const existing = await getDoc<BlogPost>('blogs', blogData.id);
    if (existing) {
      const updated = { ...existing, ...blogData } as BlogPost;
      await putDoc('blogs', updated.id, blogColumns(updated), updated);
      return updated;
    }
  }

  const slug = blogData.slug || (blogData.title || 'blog')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const newBlog: BlogPost = {
    id: blogData.id || `blog-${Date.now()}`,
    title: blogData.title || 'New Ethnic Fashion Article',
    slug,
    content: blogData.content || '',
    excerpt: blogData.excerpt || (blogData.content ? blogData.content.replace(/<[^>]+>/g, '').slice(0, 160) : ''),
    date: blogData.date || new Date().toISOString(),
    image_url: blogData.image_url || '/images/hero-trio-festive.jpg',
    author: blogData.author || 'Bhavya Fashions Editorial Desk',
    category: blogData.category || 'Ethnic Trends',
  };

  await putDoc('blogs', newBlog.id, blogColumns(newBlog), newBlog);
  return newBlog;
}

export async function deleteBlog(id: string): Promise<boolean> {
  await deleteDocs('blogs', [id]);
  return true;
}
