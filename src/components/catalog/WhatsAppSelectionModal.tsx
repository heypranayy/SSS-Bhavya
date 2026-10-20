'use client';

import React, { useState } from 'react';
import { Catalog, CatalogProductView } from '@/types';
import { SelectedItemState } from './DesignSelector';
import {
  X,
  PhoneCall,
  Copy,
  Share2,
  Check,
  MessageCircle,
  AlertCircle,
  FileText,
  ExternalLink
} from 'lucide-react';

interface WhatsAppSelectionModalProps {
  catalog: Catalog;
  products: CatalogProductView[];
  selections: Map<string, SelectedItemState>;
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsAppSelectionModal({
  catalog,
  products,
  selections,
  isOpen,
  onClose,
}: WhatsAppSelectionModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState('');

  if (!isOpen) return null;

  const productMap = new Map(products.map(p => [p.id, p]));
  const selectedItems = Array.from(selections.values()).filter(s => s.totalQuantity > 0);

  // Recipient WhatsApp phone number validation
  // Default to verified Bhavya Fashions WhatsApp number: +91 98307 29210
  const rawRecipient = catalog.presentation_settings?.contactWhatsapp ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    '919830729210';
  const cleanRecipient = rawRecipient.replace(/[^0-9]/g, '');

  // Build formatted list of items
  // Format:
  // 1. DN: DN123 — Size: M — Quantity: 4
  // 2. DN: DN245 — Size: L — Quantity: 6
  const lines: string[] = [];
  let itemCounter = 1;

  selectedItems.forEach(sel => {
    const prod = productMap.get(sel.productId);
    if (!prod) return;

    // DN code: authentic product code
    const dnCode = prod.code;
    const sizeEntries = Object.entries(sel.sizeBreakdown).filter(([_, qty]) => qty > 0);

    if (sizeEntries.length > 0) {
      sizeEntries.forEach(([size, qty]) => {
        let line = `${itemCounter}. DN: ${dnCode} — Size: ${size} — Quantity: ${qty}`;
        if (sel.notes) {
          line += ` (Note: ${sel.notes})`;
        }
        lines.push(line);
        itemCounter++;
      });
    } else {
      // Fallback if no specific size breakdown entered
      let line = `${itemCounter}. DN: ${dnCode} — Quantity: ${sel.totalQuantity}`;
      if (sel.notes) {
        line += ` (Note: ${sel.notes})`;
      }
      lines.push(line);
      itemCounter++;
    }
  });

  const catalogRef = catalog.title || catalog.public_token;

  const formattedMessage = `Hello Bhavya Fashions,

I am interested in the following designs from your catalog:

${lines.join('\n')}

Catalog reference: ${catalogRef}

Please confirm availability and the applicable wholesale pricing.`;

  const encodedUrl = `https://wa.me/${cleanRecipient}?text=${encodeURIComponent(formattedMessage)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = formattedMessage;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    setShareError('');
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Bhavya Fashions Selection — ${catalog.title}`,
          text: formattedMessage,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setShareError('Sharing was not supported or was cancelled.');
        }
      }
    } else {
      // If share API unavailable, copy instead
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#E7E0D5] my-6">
        {/* Header */}
        <div className="bg-[#FAF7F2] border-b border-[#E7E0D5] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#722F37] font-bold block">
                Review & Share
              </span>
              <h3 className="font-serif-luxury text-base sm:text-lg font-bold text-[#1C1917]">
                Send Product Selection on WhatsApp
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#78716C] hover:bg-[#EFE9E0] transition-colors"
            aria-label="Close review dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Summary Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-[#FAF7F2] p-3 rounded-xl border border-[#E7E0D5]">
            <div>
              <span className="text-[#78716C] block">Selected Designs:</span>
              <span className="font-bold text-[#1C1917]">{selectedItems.length} Designs</span>
            </div>
            <div>
              <span className="text-[#78716C] block">Total Pieces:</span>
              <span className="font-bold text-[#1C1917]">
                {selectedItems.reduce((acc, it) => acc + it.totalQuantity, 0)} pcs
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[#78716C] block">Recipient Desk:</span>
              <span className="font-mono font-bold text-[#722F37]">+{cleanRecipient}</span>
            </div>
          </div>

          {/* Selected Designs Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-2 flex items-center justify-between">
              <span>Designs to be sent ({selectedItems.length}):</span>
              <span className="text-[11px] text-[#78716C] normal-case">Preserving verified DN codes</span>
            </h4>

            <div className="divide-y divide-[#F3ECE2] border border-[#E7E0D5] rounded-xl overflow-hidden bg-white max-h-48 overflow-y-auto">
              {selectedItems.map((sel) => {
                const prod = productMap.get(sel.productId);
                if (!prod) return null;

                return (
                  <div key={sel.productId} className="p-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={prod.images[0]?.image_url}
                        alt=""
                        className="w-10 h-12 object-cover rounded bg-[#EFE9E0] shrink-0"
                      />
                      <div>
                        <span className="font-mono font-bold text-[#722F37] bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#E7E0D5] text-[11px]">
                          {prod.code}
                        </span>
                        <p className="text-[#1C1917] font-medium text-xs mt-0.5 line-clamp-1">
                          {prod.title}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5 text-[11px] text-[#78716C]">
                          {Object.entries(sel.sizeBreakdown)
                            .filter(([_, q]) => q > 0)
                            .map(([sz, q]) => (
                              <span key={sz} className="font-mono bg-[#FAF7F2] px-1 rounded border text-[10px]">
                                {sz}:{q}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-[#1C1917]">{sel.totalQuantity} pcs</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Generated WhatsApp Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#722F37]" />
                <span>WhatsApp Message Preview</span>
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] text-[#722F37] hover:underline font-semibold flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="p-3.5 bg-[#F9F7F3] rounded-xl border border-[#E7E0D5] font-mono text-[11px] text-[#292524] whitespace-pre-line leading-relaxed selection:bg-[#722F37] selection:text-white max-h-48 overflow-y-auto">
              {formattedMessage}
            </div>
          </div>

          {shareError && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{shareError}</span>
            </div>
          )}

          {/* Critical Policy Notice */}
          <p className="text-[11px] text-[#78716C] leading-relaxed">
            * Tapping the button below opens WhatsApp directly with your pre-filled inquiry. You can review and edit before sending. No purchase order or payment is processed online.
          </p>

          {/* Action CTAs */}
          <div className="space-y-2 pt-1">
            <a
              href={encodedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#20ba59] transition-all shadow-md active:scale-[0.99]"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Send Selection on WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-[#E7E0D5] bg-white text-xs font-semibold text-[#1C1917] hover:bg-[#FAF7F2] transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#78716C]" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Message'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-[#E7E0D5] bg-white text-xs font-semibold text-[#1C1917] hover:bg-[#FAF7F2] transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-[#78716C]" />
                <span>Share Alternatives</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
