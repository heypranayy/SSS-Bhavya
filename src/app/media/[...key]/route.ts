import type { Headers as WorkerHeaders } from '@cloudflare/workers-types/index.ts';
import { getBucket } from '@/lib/db';

// Workers and DOM typings describe the same Headers/ReadableStream objects differently.

/** Streams an image from the R2 bucket. Keys are immutable, so responses cache for a year. */
export async function GET(req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  let objectKey: string;
  try {
    objectKey = key.map(decodeURIComponent).join('/');
  } catch {
    return new Response('Not found', { status: 404 });
  }
  if (!objectKey || objectKey.includes('..')) {
    return new Response('Not found', { status: 404 });
  }

  const object = await getBucket().get(objectKey, { onlyIf: req.headers as unknown as WorkerHeaders });
  if (!object) {
    return new Response('Not found', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers as unknown as WorkerHeaders);
  headers.set('etag', object.httpEtag);
  if (!headers.has('cache-control')) headers.set('cache-control', 'public, max-age=31536000, immutable');

  if (!('body' in object) || !object.body) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(object.body as unknown as ReadableStream, { headers });
}
