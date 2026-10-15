import React from 'react';
import { getAllCustomers } from '@/lib/repository/catalogs';
import { Users, Phone, MapPin, Tag } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Customer Profiles & Price Lists | Bhavya Fashions Admin',
};

export default async function AdminCustomersPage() {
  const customers = await getAllCustomers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#722F37] font-bold">
            B2B Client Directory
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C1917]">
            Retailers, Boutiques & Resellers ({customers.length})
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((c) => (
          <div
            key={c.id}
            className="bg-white p-5 rounded-2xl border border-[#E7E0D5] shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-serif-luxury text-base font-bold text-[#1C1917]">
                  {c.business_name}
                </h3>
                <p className="text-xs text-[#78716C]">{c.contact_person}</p>
              </div>

              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E7E0D5] text-[#722F37]">
                {c.segment || 'Retailer'}
              </span>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[#78716C]">Price Tier:</span>
                <span className="font-bold text-[#722F37] uppercase">{c.custom_price_tier || 'Standard'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#78716C]">Discount:</span>
                <span className="font-bold text-emerald-700">{c.discount_pct || 0}% OFF Master Wholesale</span>
              </div>
            </div>

            <div className="text-xs text-[#78716C] space-y-1 pt-1">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                <span className="font-mono">{c.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{c.city}, {c.state}</span>
              </div>
            </div>

            {c.notes && (
              <p className="text-[11px] text-[#57534E] italic pt-2 border-t border-[#F3ECE2]">
                "{c.notes}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
