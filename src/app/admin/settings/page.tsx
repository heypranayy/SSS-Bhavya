'use client';

import React, { useState } from 'react';
import { Save, Check, ShieldCheck, PhoneCall, Building2, MapPin } from 'lucide-react';

export default function AdminSettingsPage() {
  const [brandName, setBrandName] = useState('Bhavya Fashions');
  const [whatsapp, setWhatsapp] = useState('919830122334');
  const [email, setEmail] = useState('wholesale@bhavyafashions.com');
  const [defaultMoq, setDefaultMoq] = useState(6);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#E7E0D5]">
        <span className="text-xs font-mono uppercase tracking-widest text-[#722F37] font-bold">
          Wholesale Configuration
        </span>
        <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C1917]">
          Platform & Dispatch Settings
        </h1>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Platform settings updated successfully.</span>
        </div>
      )}

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
                placeholder="e.g. 919830122334"
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

        <div className="bg-white p-6 rounded-2xl border border-[#E7E0D5] shadow-xs space-y-4">
          <h2 className="font-serif-luxury text-base font-bold text-[#1C1917] pb-2 border-b border-[#F3ECE2]">
            Dispatch Hubs & Showrooms
          </h2>

          <div className="p-3 bg-[#FAF7F2] rounded-xl text-xs space-y-1">
            <span className="font-bold text-[#1C1917] block">Hub 1: Barabazar Wholesale Counter</span>
            <p className="text-[#57534E]">Shiv Thakur Lane, Barabazar Market, Kolkata, West Bengal — 700007</p>
          </div>

          <div className="p-3 bg-[#FAF7F2] rounded-xl text-xs space-y-1">
            <span className="font-bold text-[#1C1917] block">Hub 2: Surat Manufacturing & Warehousing</span>
            <p className="text-[#57534E]">Sumel Industrial Textile Hub / Ring Road, Surat, Gujarat — 395002</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#5C1D24]"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
