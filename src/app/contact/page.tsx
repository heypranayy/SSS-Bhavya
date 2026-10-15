import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MapPin, Phone, Mail, Clock, MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Showroom & Wholesale Contact | Bhavya Fashions',
  description: 'Get in touch with Bhavya Fashions wholesale team. Visit our Barabazar (Kolkata) showroom or connect on WhatsApp for current catalogs and price lists.',
};

export default function ContactPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830122334';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 py-14 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-[#722F37] font-bold">
              B2B Trade Assistance
            </span>
            <h1 className="font-serif-luxury text-4xl sm:text-5xl font-bold text-[#1C1917]">
              Contact Wholesale Showroom
            </h1>
            <p className="text-sm text-[#57534E] leading-relaxed">
              We welcome fashion retailers, resellers, and boutique owners. Connect with our dedicated sales desk for bulk pricing, customized lookbooks, or sample evaluations.
            </p>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E7E0D5] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] text-[#722F37] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-serif-luxury text-base font-bold text-[#1C1917]">
                Kolkata Showroom & Dispatch
              </h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Shiv Thakur Lane / Cross Street area, Barabazar Market, Kolkata, West Bengal — 700007
              </p>
              <span className="text-[11px] text-[#722F37] font-semibold block pt-1">
                Walk-in Sample Room Open
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E7E0D5] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] text-[#722F37] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-serif-luxury text-base font-bold text-[#1C1917]">
                Surat Manufacturing Unit
              </h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Ring Road Textile Hub / Sumel Industrial Park, Surat, Gujarat — 395002
              </p>
              <span className="text-[11px] text-[#722F37] font-semibold block pt-1">
                Bulk Production & All-India Parcel Dispatch
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E7E0D5] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] text-[#722F37] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-serif-luxury text-base font-bold text-[#1C1917]">
                Direct Wholesale Helpline
              </h3>
              <div className="space-y-1 text-xs text-[#78716C]">
                <p>Phone: +91 98301 22334 / +91 98205 66778</p>
                <p>WhatsApp: +91 98301 22334</p>
                <p>Email: wholesale@bhavyafashions.com</p>
                <p>Hours: Mon – Sat: 10:30 AM to 7:30 PM</p>
              </div>
            </div>
          </div>

          {/* Quick Direct WhatsApp Card */}
          <div className="bg-[#722F37] text-white rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="font-serif-luxury text-2xl font-bold">
                Need an Immediate WhatsApp Catalog?
              </h3>
              <p className="text-xs text-white/80 max-w-xl leading-relaxed">
                Our sales team can instantly generate a personalized wholesale link configured for your store with current warehouse stocks and ratio breakdown.
              </p>
            </div>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Bhavya Fashions, I am an apparel retailer looking for current kurti wholesale catalogs.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#20ba59] transition-all shadow-md shrink-0"
            >
              <Phone className="w-4 h-4" />
              <span>Connect on WhatsApp Now</span>
            </a>
          </div>

          {/* FAQ Accordion */}
          <div className="bg-white border border-[#E7E0D5] rounded-2xl p-8 space-y-6">
            <h3 className="font-serif-luxury text-xl font-bold text-[#1C1917]">
              Frequently Asked Wholesale Questions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#57534E]">
              <div className="space-y-1.5">
                <h4 className="font-bold text-[#1C1917]">What is the Minimum Order Quantity (MOQ)?</h4>
                <p className="leading-relaxed">
                  Our minimum order quantity is 6 pieces per design (standard ratio packing M, L, XL, XXL). For select 3-piece sets, MOQ is 6 pieces.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-[#1C1917]">Do you provide retail or single piece orders?</h4>
                <p className="leading-relaxed">
                  No. Bhavya Fashions strictly operates as a B2B wholesale platform. We do not sell single pieces to retail consumers to safeguard the retail profits of our boutique clients.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-[#1C1917]">How are parcels shipped to other states?</h4>
                <p className="leading-relaxed">
                  We book consignments via reputable goods transport companies (V-Trans, TCI Freight, ARC, SafeXpress) with docket tracking provided on WhatsApp.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-[#1C1917]">Is GST billing mandatory?</h4>
                <p className="leading-relaxed">
                  Yes, wholesale dispatches are accompanied by tax invoices with 5% GST applicable on apparel under ₹1000 / 12% above ₹1000.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
