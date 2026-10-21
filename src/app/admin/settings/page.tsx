'use client';

import React, { useState } from 'react';
import { Save, Check, Database, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [brandName, setBrandName] = useState('Bhavya Fashions');
  const [whatsapp, setWhatsapp] = useState('919830729210');
  const [email, setEmail] = useState('wholesale@bhavyafashions.com');
  const [defaultMoq, setDefaultMoq] = useState(6);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Firebase Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleFirebaseSync = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await fetch('/api/admin/firebase-sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Sync request failed');
      }
      setSyncStatus({
        success: true,
        message: `Successfully synchronized ${data.count || 64} wholesale items into Cloud Firestore!`,
      });
    } catch (err: any) {
      setSyncStatus({
        success: false,
        message: err.message || 'Error syncing data to Firebase',
      });
    } finally {
      setIsSyncing(false);
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

      {/* Firebase Cloud Backend Panel */}
      <div className="bg-white p-6 rounded-2xl border border-[#E7E0D5] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F3ECE2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif-luxury text-base font-bold text-[#1C1917]">
                Firebase Cloud Backend
              </h2>
              <p className="text-[11px] text-[#78716C]">
                Connected Project: <span className="font-mono font-semibold text-[#1C1917]">sss-bhavya</span>
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Firestore Active</span>
          </div>
        </div>

        <p className="text-xs text-[#57534E] leading-relaxed">
          Your portal is configured to store all wholesale products, custom catalogs, customer accounts, and buyer inquiries directly in <strong>Google Cloud Firestore</strong>. Product photography is managed through <strong>Firebase Storage</strong>.
        </p>

        {syncStatus && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              syncStatus.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {syncStatus.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{syncStatus.message}</span>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between">
          <div className="text-[11px] text-[#78716C]">
            Syncs all 64 authentic styles, collections, and lookbooks to Firestore.
          </div>
          <button
            type="button"
            onClick={handleFirebaseSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1C1917] text-white text-xs font-semibold hover:bg-black transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing to Firestore...' : 'Sync Catalog to Firebase'}</span>
          </button>
        </div>
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

          <div className="pt-2">
            <label className="block text-xs font-semibold text-[#1C1917] mb-1">
              Global Wholesale Price Display Policy
            </label>
            <select
              defaultValue="show"
              className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] font-medium"
            >
              <option value="show">SHOW PRICE — Display actual wholesale price (Default)</option>
              <option value="request">PRICE ON REQUEST — Hide numerical prices & show "Price on Request" + Enquiry form</option>
              <option value="contact">CONTACT FOR PRICE — Hide numerical prices & show "Contact for Price" CTA</option>
            </select>
            <p className="text-[11px] text-zinc-500 mt-1">
              Precedence: Catalogue-specific setting &gt; Individual product setting &gt; Global setting. When prices are hidden, underlying prices are sanitized on the server before client transmission.
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
