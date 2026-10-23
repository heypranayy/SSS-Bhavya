'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  LifeBuoy,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Mail,
  ExternalLink,
  MessageCircle,
  FileQuestion,
  ShieldAlert,
} from 'lucide-react';
import { TicketCategory, TicketPriority, SupportTicket } from '@/types/tickets';

interface RaiseTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated?: (ticket: SupportTicket) => void;
  initialCategory?: TicketCategory;
}

export function RaiseTicketModal({
  isOpen,
  onClose,
  onTicketCreated,
  initialCategory = 'bug_glitch',
}: RaiseTicketModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TicketCategory>(initialCategory);
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [description, setDescription] = useState('');
  const [screenUrl, setScreenUrl] = useState('');
  const [submitterName, setSubmitterName] = useState('Bhavya Team');
  const [submitterEmail, setSubmitterEmail] = useState('sss@bhavyafashions.com');
  const [submitterPhone, setSubmitterPhone] = useState('+91 98307 29210');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdTicket, setCreatedTicket] = useState<SupportTicket | null>(null);
  const [mailtoUrl, setMailtoUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setScreenUrl(window.location.pathname + window.location.search);
      const user = localStorage.getItem('bhavya_admin_user');
      if (user) {
        setSubmitterEmail(user);
        if (user.includes('sss')) setSubmitterName('Bhavya Super Admin');
        else if (user.includes('pranay')) setSubmitterName('Pranay (Gexart Lead)');
        else setSubmitterName(user.split('@')[0]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please provide a ticket title and description.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          priority,
          description,
          screen_url: screenUrl,
          submitter_name: submitterName,
          submitter_email: submitterEmail,
          submitter_phone: submitterPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit ticket');
      }

      setCreatedTicket(data.ticket);
      setMailtoUrl(data.mailtoUrl || '');
      if (onTicketCreated) onTicketCreated(data.ticket);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error raising ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setCategory('bug_glitch');
    setPriority('medium');
    setCreatedTicket(null);
    setMailtoUrl('');
    setErrorMsg('');
    onClose();
  };

  const whatsappAlertUrl = createdTicket
    ? `https://wa.me/919830729210?text=${encodeURIComponent(
        `🚨 *New Bhavya Support Ticket #${createdTicket.ticket_number}*\n*Priority:* ${createdTicket.priority.toUpperCase()}\n*Title:* ${createdTicket.title}\n*Raised by:* ${createdTicket.submitter_name} (${createdTicket.submitter_email})\n*Routed to:* pranay@gexart.com`
      )}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#E7E0D5] shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1C1917] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C5A059] text-black flex items-center justify-center font-bold">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-base font-bold text-white">
                Raise Technical Ticket
              </h3>
              <p className="text-[11px] text-[#A8A29E]">
                Direct Priority Routing to{' '}
                <span className="text-[#C5A059] font-mono font-semibold">pranay@gexart.com</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {createdTicket ? (
            /* Success confirmation */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
                  Ticket Raised Successfully!
                </h4>
                <p className="text-xs text-[#78716C] mt-1">
                  Ticket Reference:{' '}
                  <span className="font-mono font-bold text-[#722F37] bg-[#722F37]/10 px-2 py-0.5 rounded">
                    {createdTicket.ticket_number}
                  </span>
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E7E0D5] text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-[#F3ECE2] pb-1.5">
                  <span className="text-[#78716C]">Assigned Tech Lead:</span>
                  <span className="font-semibold text-[#1C1917]">Pranay (Gexart Technologies)</span>
                </div>
                <div className="flex justify-between border-b border-[#F3ECE2] pb-1.5">
                  <span className="text-[#78716C]">Notification Email:</span>
                  <span className="font-mono font-semibold text-[#C5A059]">pranay@gexart.com</span>
                </div>
                <div className="flex justify-between border-b border-[#F3ECE2] pb-1.5">
                  <span className="text-[#78716C]">Priority:</span>
                  <span className="font-bold uppercase text-[#722F37]">{createdTicket.priority}</span>
                </div>
                <div className="pt-1">
                  <span className="text-[#78716C] block font-semibold mb-0.5">Summary:</span>
                  <p className="text-[#1C1917] italic">{createdTicket.title}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-2">
                {mailtoUrl && (
                  <a
                    href={mailtoUrl}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#722F37] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#5C1D24] transition-colors shadow-sm"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Open in Email App to Send Copy to pranay@gexart.com</span>
                  </a>
                )}

                <div className="flex gap-2">
                  <a
                    href={whatsappAlertUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Send WhatsApp Alert</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 py-2 px-3 rounded-xl border border-[#E7E0D5] bg-white text-[#1C1917] font-semibold text-xs hover:bg-[#F3ECE2] transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Ticket Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Notice Banner */}
              <div className="bg-[#1C1917]/5 border border-[#1C1917]/10 p-3 rounded-xl text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-[#722F37] flex-shrink-0 mt-0.5" />
                <p className="text-[#78716C]">
                  This ticket is directly routed to <strong className="text-[#1C1917]">pranay@gexart.com</strong>.
                  Please describe the bug or task clearly with steps to reproduce.
                </p>
              </div>

              {/* Ticket Title */}
              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1">
                  Issue Title / Summary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. WhatsApp quotation button alignment on mobile catalog"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E7E0D5] bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#E7E0D5] bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                  >
                    <option value="bug_glitch">🐛 Bug / UI Glitch</option>
                    <option value="catalog_issue">📖 Catalog / Lookbook</option>
                    <option value="inquiry_whatsapp">💬 Wholesale Inquiry / WhatsApp</option>
                    <option value="inventory_pricing">🏷️ Inventory &amp; Pricing</option>
                    <option value="feature_request">💡 Feature Request</option>
                    <option value="urgent_outage">🚨 Critical / Outage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#E7E0D5] bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                  >
                    <option value="low">Low - Minor feedback</option>
                    <option value="medium">Medium - Standard fix</option>
                    <option value="high">High - Impairing operations</option>
                    <option value="critical">🚨 Critical - Blocked trade/order</option>
                  </select>
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1">
                  Detailed Description &amp; Steps <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what happened, what was expected, and which customer/catalog was affected..."
                  className="w-full text-xs p-3 rounded-xl border border-[#E7E0D5] bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                />
              </div>

              {/* Screen URL & Submitter Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#78716C] mb-1">
                    Affected Screen / URL
                  </label>
                  <input
                    type="text"
                    value={screenUrl}
                    onChange={(e) => setScreenUrl(e.target.value)}
                    placeholder="/admin/catalogs"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#E7E0D5] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#78716C] mb-1">
                    Your Name / Role
                  </label>
                  <input
                    type="text"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    placeholder="Bhavya Team"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#E7E0D5] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#78716C] mb-1">
                    Your Contact Email
                  </label>
                  <input
                    type="email"
                    value={submitterEmail}
                    onChange={(e) => setSubmitterEmail(e.target.value)}
                    placeholder="sss@bhavyafashions.com"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#E7E0D5] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#78716C] mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={submitterPhone}
                    onChange={(e) => setSubmitterPhone(e.target.value)}
                    placeholder="+91 98307 29210"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#E7E0D5] bg-white"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#F3ECE2]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-[#E7E0D5] text-[#1C1917] hover:bg-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#722F37] hover:bg-[#5C1D24] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Dispatching to Pranay...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Ticket to pranay@gexart.com</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
