// Bindings from wrangler.jsonc. Typed here instead of with `wrangler types`, whose
// global runtime types would replace the browser DOM types the client components use.
declare module 'cloudflare:workers' {
  import type { D1Database, R2Bucket } from '@cloudflare/workers-types/index.ts';

  export const env: {
    DB: D1Database;
    BUCKET: R2Bucket;
  };
}
