// scripts/download-real-images.js
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const prods = require('../src/lib/data/migrated-products.json');
const targetDir = path.join(__dirname, '../public/images/products');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function downloadImage(url, destPath) {
  return new Promise((resolve) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
      return resolve({ success: true, skipped: true });
    }

    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath).then(resolve);
      }

      if (res.statusCode !== 200) {
        return resolve({ success: false, error: `Status ${res.statusCode}` });
      }

      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve({ success: true }));
      });
      file.on('error', (err) => {
        fs.unlink(destPath, () => {});
        resolve({ success: false, error: err.message });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
  });
}

async function run() {
  console.log(`Starting download of real images for ${prods.length} products...`);
  let downloaded = 0;
  let failed = 0;
  let total = 0;

  for (let i = 0; i < prods.length; i++) {
    const p = prods[i];
    const images = p.images || [];

    for (let j = 0; j < images.length; j++) {
      total++;
      const img = images[j];
      const ext = path.extname(new URL(img.image_url).pathname) || '.jpg';
      const filename = `${p.code.toLowerCase()}-${j}${ext}`;
      const destPath = path.join(targetDir, filename);

      const res = await downloadImage(img.image_url, destPath);
      if (res.success) {
        downloaded++;
        img.local_url = `/images/products/${filename}`;
      } else {
        failed++;
        console.warn(`[WARN] Failed to download ${img.image_url}: ${res.error}`);
      }
    }
  }

  console.log(`Finished: ${downloaded}/${total} images processed (${failed} failed).`);

  // Write updated migrated-products.json with local_url
  fs.writeFileSync(
    path.join(__dirname, '../src/lib/data/migrated-products.json'),
    JSON.stringify(prods, null, 2),
    'utf-8'
  );
  console.log('Updated src/lib/data/migrated-products.json with local image paths.');
}

run();
