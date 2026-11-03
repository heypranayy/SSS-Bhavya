import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 25000,
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      // Each test file gets its own in-memory D1 + R2 (see tests/helpers/cloudflare-workers.ts).
      'cloudflare:workers': path.resolve(import.meta.dirname, './tests/helpers/cloudflare-workers.ts'),
    },
  },
});
