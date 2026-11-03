'use client';

import React, { useState, useEffect } from 'react';
import { Save, Check, Database, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function AdminSettingsPage() {
  const [brandName, setBrandName] = useState('Bhavya Fashions');
  const [whatsapp, setWhatsapp] = useState('919830729210');
  const [email, setEmail] = useState('wholesale@bhavyafashions.com');
  const [defaultMoq, setDefaultMoq] = useState(6);
  const [mainWebsiteShowPrices, setMainWebsiteShowPrices] = useState(false);
  const [customCatalogueShowPrices, setCustomCatalogueShowPrices] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (typeof data.mainWebsiteShowPrices === 'boolean') setMainWebsiteShowPrices(data.mainWebsiteShowPrices);
          if (typeof data.customCatalogueShowPrices === 'boolean') setCustomCatalogueShowPrices(data.customCatalogueShowPrices);
          if (data.brandName) setBrandName(data.brandName);
          if (data.whatsapp) setWhatsapp(data.whatsapp);
          if (data.email) setEmail(data.email);
          if (data.defaultMoq) setDefaultMoq(data.defaultMoq);
        }
      })
      .catch((err) => console.error('Failed to load settings:', err));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName,
          whatsapp,
          email,
          defaultMoq,
          mainWebsiteShowPrices,
          customCatalogueShowPrices,
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#E7E0D5]">
        <span className="text-xs font-mono uppercase tracking-widest text-[#722F37] font-bold">
          Wholesale Configuration
        </span>
        <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C1917]">
          Platform & Backend Settings
        </h1>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Platform settings updated successfully.</span>
        </div>
      )}

      {/* Cloudflare Backend Panel */}
      <div className="bg-white p-6 rounded-2xl border border-[#E7E0D5] shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#F3ECE2]">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
            <Database className="w-4 h-4" />
          </div>
          <h2 className="font-serif-luxury text-base font-bold text-[#1C1917]">Cloudflare Backend</h2>
        </div>
        <p className="text-xs text-[#57534E] leading-relaxed">
          Products, catalogs, customers, inquiries and staff accounts are stored in <strong>Cloudflare D1</strong>. Product photography is stored in <strong>Cloudflare R2</strong>. Changes save instantly; there is nothing to sync.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E7E0D5] shadow-xs space-y-4">
          <h2 className="font-serif-luxury text-base font-bold text-[#1C1917] pb-2 border-b border-[#F3ECE2]">
            Wholesale Routing & Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Brand Trading Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                WhatsApp Desk Routing Number
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. 919830729210"
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Sales & Invoicing Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Default Minimum Order Quantity (MOQ)
              </label>
              <input
                type="number"
                value={defaultMoq}
                onChange={(e) => setDefaultMoq(Number(e.target.value))}
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
              />
            </div>
          </div>
        </div>

        {/* Wholesale Price Display & Shielding Policy */}
        <div className="bg-white p-6 rounded-2xl border border-[#E7E0D5] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F3ECE2]">
            <div>
              <h2 className="font-serif-luxury text-base font-bold text-[#1C1917] flex items-center gap-2">
                <span>Wholesale Pricing Visibility & Shielding</span>
              </h2>
              <p className="text-[11px] text-[#78716C]">
                Configure price shielding between public storefront and private custom buyer catalogues.
              </p>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                mainWebsiteShowPrices
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300'
              }`}
            >
              {mainWebsiteShowPrices ? 'Website Prices: UNBLOCKED' : 'Website Prices: BLOCKED (Default)'}
            </span>
          </div>

          {/* Setting 1: Main Website Price Blocking */}
          <div className="p-4 rounded-xl border border-[#E7E0D5] bg-[#FAF7F2] space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1C1917]">Main Website Price Display</span>
                  <span className="text-[10px] font-mono bg-[#722F37]/10 text-[#722F37] px-2 py-0.5 rounded font-bold">
                    Always Blocked by Default
                  </span>
                </div>
                <p className="text-xs text-[#57534E] leading-relaxed">
                  By default, wholesale prices are strictly hidden across all public pages (Home, Wholesale Explorer, Collections). Visitors see &ldquo;Price on Enquiry&rdquo; / &ldquo;Quote on Request&rdquo;. You can unblock prices for public viewing using the switch below.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={mainWebsiteShowPrices}
                  onChange={(e) => setMainWebsiteShowPrices(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#722F37]"></div>
              </label>
            </div>

            <div className="pt-2 border-t border-[#E7E0D5]/60 flex items-center gap-2 text-[11px]">
              {mainWebsiteShowPrices ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-amber-800 font-semibold">
                    Unblocked: Numerical wholesale prices will be visible to all visitors on the main website.
                  </span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="text-emerald-800 font-semibold">
                    Blocked (Active): Numerical prices are hidden on the main website; buyers must click &ldquo;Price on Enquiry&rdquo;.
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Setting 2: Custom Catalogue Price Policy */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Custom Catalogue Pricing</span>
              </span>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                ✓ Contained by Default
              </span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              In private custom buyer catalogues generated via the Universal Catalog Builder (`/catalog/[token]`), wholesale rates and buyer discount margins are <strong>contained and displayed by default</strong>. If needed, you can toggle presentation visibility per catalog in the builder.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E7E0D5] shadow-xs space-y-4">
          <h2 className="font-serif-luxury text-base font-bold text-[#1C1917] pb-2 border-b border-[#F3ECE2]">
            Dispatch Hubs & Showrooms
          </h2>

          <div className="p-3 bg-[#FAF7F2] rounded-xl text-xs space-y-1">
            <span className="font-bold text-[#1C1917] block">Hub 1: Barabazar Wholesale Counter & Dispatch Showroom</span>
            <p className="text-[#57534E]">5, Shiv Thakur Lane, Kalakar St, near R.K The Bed Cover Studio, Kolkata, West Bengal — 700007</p>
          </div>

          <div className="p-3 bg-[#FAF7F2] rounded-xl text-xs space-y-1">
            <span className="font-bold text-[#1C1917] block">Hub 2: Surat Manufacturing & Warehousing</span>
            <p className="text-[#57534E]">Sumel Industrial Textile Hub / Ring Road, Surat, Gujarat — 395002</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSavingSettings}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#5C1D24] disabled:opacity-50 cursor-pointer"
          >
            <Save className={`w-4 h-4 ${isSavingSettings ? 'animate-spin' : ''}`} />
            <span>{isSavingSettings ? 'Saving Settings...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
