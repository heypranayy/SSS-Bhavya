import fs from 'fs';
import path from 'path';
import migratedBlogsRaw from '@/lib/data/migrated-blogs.json';
import { getFirebaseDb, isFirebaseConfigured, sanitizeForFirestore } from '@/lib/firebase/config';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

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

const SEED_BLOGS: BlogPost[] = migratedBlogsRaw as BlogPost[];
let inMemoryBlogs: BlogPost[] = [...SEED_BLOGS];

function getCustomBlogsFilePath(): string {
  return path.join(process.cwd(), 'src', 'lib', 'data', 'custom-blogs.json');
}

function loadPersistedBlogs(): BlogPost[] {
  try {
    const filePath = getCustomBlogsFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      if (data.trim()) return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read custom blogs:', err);
  }
  return [];
}

function savePersistedBlogs(blogs: BlogPost[]): void {
  try {
    const filePath = getCustomBlogsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(blogs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write custom blogs:', err);
  }
}

export async function getAllBlogs(): Promise<BlogPost[]> {
  const persisted = loadPersistedBlogs();
  const mergedMap = new Map<string, BlogPost>();

  for (const b of SEED_BLOGS) {
    mergedMap.set(b.id, b);
  }
  for (const b of inMemoryBlogs) {
    mergedMap.set(b.id, b);
  }
  for (const b of persisted) {
    mergedMap.set(b.id, b);
  }

  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        const snap = await getDocs(collection(db, 'blogs'));
        snap.forEach((d) => {
          const item = d.data() as BlogPost;
          if (item && item.id) {
            mergedMap.set(item.id, item);
          }
        });
      }
    } catch {}
  }

  const all = Array.from(mergedMap.values());
  all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  inMemoryBlogs = all;

  return all;
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const blogs = await getAllBlogs();
  return blogs.find(b => b.slug === slug) || null;
}

export async function saveBlog(blogData: Partial<BlogPost>): Promise<BlogPost> {
  const persisted = loadPersistedBlogs();

  if (blogData.id) {
    const idx = persisted.findIndex(b => b.id === blogData.id);
    if (idx !== -1) {
      persisted[idx] = {
        ...persisted[idx],
        ...blogData,
      } as BlogPost;
      savePersistedBlogs(persisted);
      await getAllBlogs();

      if (isFirebaseConfigured()) {
        try {
          const db = getFirebaseDb();
          if (db) {
            await setDoc(doc(db, 'blogs', persisted[idx].id), sanitizeForFirestore(persisted[idx]), { merge: true });
          }
        } catch {}
      }

      return persisted[idx];
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

  persisted.unshift(newBlog);
  savePersistedBlogs(persisted);
  inMemoryBlogs.unshift(newBlog);

  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        await setDoc(doc(db, 'blogs', newBlog.id), sanitizeForFirestore(newBlog), { merge: true });
      }
    } catch {}
  }

  return newBlog;
}

export async function deleteBlog(id: string): Promise<boolean> {
  const persisted = loadPersistedBlogs();
  const next = persisted.filter(b => b.id !== id);
  savePersistedBlogs(next);
  inMemoryBlogs = inMemoryBlogs.filter(b => b.id !== id);

  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        await deleteDoc(doc(db, 'blogs', id));
      }
    } catch {}
  }

  return true;
}
