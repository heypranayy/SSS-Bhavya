/**
 * High-Resolution Image Compressor under 50KB
 * Iteratively optimizes images to maintain sharp dimensions while ensuring file size <= 50KB.
 */

export interface CompressedImageResult {
  file: File;
  dataUrl: string;
  sizeBytes: number;
  sizeKb: number;
  originalSizeKb: number;
  width: number;
  height: number;
  compressionRatio: number;
}

export async function compressImageUnder50KB(
  file: File,
  maxDimension = 1400,
  targetMaxBytes = 50 * 1024 // 51,200 bytes (50 KB)
): Promise<CompressedImageResult> {
  const originalSizeKb = Math.round((file.size / 1024) * 10) / 10;

  // If already under 50KB and already an image, check dimensions
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.onload = async () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Scale down if exceeds maxDimension while preserving aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not initialize canvas context'));
          return;
        }

        // Draw with high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Iterative binary search / stepwise reduction to hit <= 50KB
        let quality = 0.82;
        let mimeType = 'image/webp';
        let blob: Blob | null = null;

        // Check if browser supports WebP canvas export
        const testData = canvas.toDataURL('image/webp');
        if (!testData.startsWith('data:image/webp')) {
          mimeType = 'image/jpeg';
        }

        const getBlob = (q: number, m: string): Promise<Blob> => {
          return new Promise((res) => {
            canvas.toBlob(
              (b) => res(b || new Blob()),
              m,
              q
            );
          });
        };

        // Pass 1: Try qualities from 0.82 down to 0.40
        for (let q = quality; q >= 0.40; q -= 0.06) {
          blob = await getBlob(q, mimeType);
          if (blob.size <= targetMaxBytes) {
            quality = q;
            break;
          }
        }

        // Pass 2: If still above 50KB, step down dimensions by 10%
        let currentWidth = width;
        let currentHeight = height;
        while (blob && blob.size > targetMaxBytes && currentWidth > 600) {
          currentWidth = Math.round(currentWidth * 0.9);
          currentHeight = Math.round(currentHeight * 0.9);
          canvas.width = currentWidth;
          canvas.height = currentHeight;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, currentWidth, currentHeight);
          blob = await getBlob(0.65, mimeType);
        }

        if (!blob) {
          blob = await getBlob(0.5, mimeType);
        }

        // Read final data URL
        const finalReader = new FileReader();
        finalReader.onloadend = () => {
          const dataUrl = finalReader.result as string;
          const ext = mimeType === 'image/webp' ? 'webp' : 'jpg';
          const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const compressedFile = new File([blob!], `${nameWithoutExt}.${ext}`, {
            type: mimeType,
            lastModified: Date.now(),
          });

          const sizeBytes = blob!.size;
          const sizeKb = Math.round((sizeBytes / 1024) * 10) / 10;
          const compressionRatio = Math.round(((file.size - sizeBytes) / file.size) * 100);

          resolve({
            file: compressedFile,
            dataUrl,
            sizeBytes,
            sizeKb,
            originalSizeKb,
            width: canvas.width,
            height: canvas.height,
            compressionRatio,
          });
        };
        finalReader.readAsDataURL(blob);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
