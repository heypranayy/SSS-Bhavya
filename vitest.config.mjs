import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vitest/config';

if (fs.existsSync('.env.local')) {
  try {
    process.loadEnvFile('.env.local');
  } catch {}
}

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 25000,
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
