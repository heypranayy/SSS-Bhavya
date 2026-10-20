'use client';

import React, { useState, useRef } from 'react';
import { compressImageUnder50KB, CompressedImageResult } from '@/lib/utils/image-compression';
import { UploadCloud, CheckCircle2, Image as ImageIcon, Loader2, X, RefreshCw, Sparkles } from 'lucide-react';

interface ImageUploadDropzoneProps {
  value?: string;
  currentImageUrl?: string;
  onChange?: (url: string, stats?: { sizeKb: number; originalSizeKb: number }) => void;
  onUploadComplete?: (url: string) => void;
  label?: string;
  helperText?: string;
  className?: string;
}

export function ImageUploadDropzone({
  value,
  currentImageUrl,
  onChange,
  onUploadComplete,
  label = 'Upload Image from System',
  helperText = 'Files are automatically compressed under 50KB in high resolution.',
  className = '',
}: ImageUploadDropzoneProps) {
  const displayUrl = value || currentImageUrl || '';
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressStats, setCompressStats] = useState<{
    sizeKb: number;
    originalSizeKb: number;
    width: number;
    height: number;
    ratio: number;
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    setErrorMsg(null);
    setIsCompressing(true);

    try {
      // 1. Compress client-side under 50KB high resolution
      const result: CompressedImageResult = await compressImageUnder50KB(file);

      // 2. Upload to server to persist in /uploads/
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl: result.dataUrl,
          filename: file.name,
        }),
      });

      const uploadData = await uploadRes.json();
      const finalUrl = uploadData.success && uploadData.url ? uploadData.url : result.dataUrl;

      setCompressStats({
        sizeKb: result.sizeKb,
        originalSizeKb: result.originalSizeKb,
        width: result.width,
        height: result.height,
        ratio: result.compressionRatio,
      });

      onChange?.(finalUrl, {
        sizeKb: result.sizeKb,
        originalSizeKb: result.originalSizeKb,
      });
      onUploadComplete?.(finalUrl);
    } catch (err: any) {
      console.error('Image compression failed:', err);
      setErrorMsg(err.message || 'Image compression failed');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
    onUploadComplete?.('');
    setCompressStats(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-[#1C1917] flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Auto &lt; 50KB High-Res
          </span>
        </label>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {displayUrl ? (
        /* Preview with Stats */
        <div className="relative bg-white rounded-xl border border-[#E7E0D5] p-3 shadow-xs flex items-center gap-4">
          <div className="relative w-16 h-20 bg-[#FAF7F2] rounded-lg overflow-hidden shrink-0 border border-[#E7E0D5]">
            <img src={displayUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-[#1C1917] truncate">
                Image Ready &amp; Optimized
              </span>
            </div>

            {compressStats ? (
              <div className="text-[11px] text-[#78716C] space-y-0.5">
                <p>
                  Size: <strong className="text-emerald-700 font-mono font-bold">{compressStats.sizeKb} KB</strong>{' '}
                  <span className="text-zinc-400">(&lt; 50 KB guaranteed)</span>
                </p>
                <p className="text-[10px]">
                  Original: {compressStats.originalSizeKb} KB • {compressStats.width}×{compressStats.height}px
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-zinc-500 truncate font-mono">{displayUrl}</p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#722F37] hover:underline"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Replace</span>
              </button>
              <span className="text-zinc-300">•</span>
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:underline"
              >
                <X className="w-3 h-3" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone Upload Button */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-[#722F37] bg-[#722F37]/5'
              : 'border-[#D6CEBE] bg-[#FAF7F2] hover:bg-white hover:border-[#722F37]'
          }`}
        >
          {isCompressing ? (
            <div className="py-3 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#722F37]" />
              <p className="text-xs font-bold text-[#1C1917]">
                Compressing high-resolution photo under 50KB...
              </p>
              <p className="text-[10px] text-[#78716C]">
                Optimizing dimensions and encoding WebP/progressive raster...
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-white border border-[#E7E0D5] text-[#722F37] flex items-center justify-center mx-auto shadow-2xs">
                <UploadCloud className="w-5 h-5" />
              </div>

              <div>
                <span className="text-xs font-bold text-[#722F37] hover:underline">
                  Click to browse local files
                </span>
                <span className="text-xs text-[#78716C]"> or drag &amp; drop photo here</span>
              </div>

              <p className="text-[10px] text-[#A8A29E]">
                JPG, PNG, WebP supported • Automatic compression strictly under 50KB in crisp high resolution
              </p>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <p className="text-xs text-red-600 font-semibold">{errorMsg}</p>
      )}

      {helperText && !errorMsg && !compressStats && (
        <p className="text-[10px] text-[#78716C]">{helperText}</p>
      )}
    </div>
  );
}
