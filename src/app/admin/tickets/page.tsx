'use client';

import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  PlusCircle,
  Mail,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Filter,
  ShieldCheck,
  Send,
  Check,
  Edit3,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import {
  SupportTicket,
  TicketStatus,
  buildTicketMailtoUrl,
  buildReplyToSubmitterMailtoUrl,
  buildReplyToSubmitterWhatsAppUrl,
} from '@/types/tickets';
import { RaiseTicketModal } from '@/components/admin/RaiseTicketModal';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');

  // Editing resolution notes state per ticket
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [activeNotesDraft, setActiveNotesDraft] = useState<{ [id: string]: string }>({});
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);

  const isPranay = currentUser.toLowerCase().includes('pranay');
  const isSuperAdmin = currentUser.toLowerCase().includes('sss') || isPranay;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('bhavya_admin_user') || '';
      setCurrentUser(user);
    }
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/tickets');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setTickets(data);
          const drafts: { [id: string]: string } = {};
          data.forEach((t) => {
            if (t.resolution_notes) drafts[t.id] = t.resolution_notes;
          });
          setActiveNotesDraft(drafts);
        }
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleStatusChange = async (id: string, newStatus: TicketStatus, notes?: string) => {
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus,
          resolution_notes: notes !== undefined ? notes : activeNotesDraft[id],
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setTickets((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
        );
      }
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    }
  };

  const handleSaveNotes = async (id: string) => {
    setSavingNoteId(id);
    try {
      const currentTicket = tickets.find((t) => t.id === id);
      const res = await fetch('/api/admin/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: currentTicket?.status || 'in_progress',
          resolution_notes: activeNotesDraft[id] || '',
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setTickets((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
        );
        setEditingNotesId(null);
      }
    } catch (err) {
      console.error('Failed to save resolution notes:', err);
    } finally {
      setSavingNoteId(null);
    }
  };

  const handleQuickResolveAndReply = async (ticket: SupportTicket) => {
    const notes = activeNotesDraft[ticket.id] || 'Your issue has been resolved by Gexart Technical Support.';
    await handleStatusChange(ticket.id, 'resolved', notes);
    // Open email reply to submitter
    const replyUrl = buildReplyToSubmitterMailtoUrl(ticket, notes);
    window.location.href = replyUrl;
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesSearch =
      ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
      ticket.description.toLowerCase().includes(search.toLowerCase()) ||
      ticket.submitter_name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalOpen = tickets.filter((t) => t.status === 'open').length;
  const totalInProgress = tickets.filter((t) => t.status === 'in_progress').length;
  const totalResolved = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E7E0D5] shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-[#722F37]/10 text-[#722F37]">
              <LifeBuoy className="w-5 h-5" />
            </span>
            <h1 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">
              {isPranay
                ? 'Gexart Engineering Support Desk'
                : 'Gexart Technical Support Helpdesk'}
            </h1>
            {isPranay && (
              <span className="text-[10px] font-mono font-bold bg-[#C5A059] text-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Tech Lead Controller (pranay@gexart.com)
              </span>
            )}
          </div>
          <p className="text-xs text-[#78716C] max-w-2xl">
            {isPranay
              ? 'Incoming Bhavya Fashions tickets are routed directly to your desk. Update status, log technical resolution notes, and reply back to the submitters.'
              : 'Direct engineering support channel. Have an issue, bug, or feature requirement? Submit a ticket to Gexart Support for rapid technical resolution.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={fetchTickets}
            className="p-2.5 rounded-xl border border-[#E7E0D5] text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            title="Refresh tickets"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setShowRaiseModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#722F37] hover:bg-[#5C1D24] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Contact Gexart Support</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E7E0D5]">
          <span className="text-[11px] font-mono uppercase text-[#78716C] block">Total Tickets</span>
          <span className="text-2xl font-bold font-serif-luxury text-[#1C1917]">{tickets.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E7E0D5]">
          <span className="text-[11px] font-mono uppercase text-red-600 font-bold block">Open Issues</span>
          <span className="text-2xl font-bold font-serif-luxury text-red-700">{totalOpen}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E7E0D5]">
          <span className="text-[11px] font-mono uppercase text-amber-600 font-bold block">In Progress</span>
          <span className="text-2xl font-bold font-serif-luxury text-amber-700">{totalInProgress}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E7E0D5]">
          <span className="text-[11px] font-mono uppercase text-emerald-600 font-bold block">Resolved</span>
          <span className="text-2xl font-bold font-serif-luxury text-emerald-700">{totalResolved}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E0D5] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket #, issue, submitter..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'open', 'in_progress', 'resolved'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#1C1917] text-[#C5A059]'
                  : 'bg-[#FAF7F2] text-[#78716C] hover:bg-[#F3ECE2]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-[#E7E0D5] text-[#78716C] text-xs">
            Loading support tickets...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-[#E7E0D5] space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-serif-luxury text-base font-bold text-[#1C1917]">
              No Tickets Match Filter
            </h3>
            <p className="text-xs text-[#78716C] max-w-sm mx-auto">
              All reported items are resolved or no tickets currently match your search query.
            </p>
            <button
              type="button"
              onClick={() => setShowRaiseModal(true)}
              className="px-4 py-2 bg-[#722F37] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#5C1D24] cursor-pointer"
            >
              Contact Gexart Support
            </button>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const replyMailtoUrl = buildReplyToSubmitterMailtoUrl(
              ticket,
              activeNotesDraft[ticket.id]
            );
            const replyWhatsAppUrl = buildReplyToSubmitterWhatsAppUrl(
              ticket,
              activeNotesDraft[ticket.id]
            );

            const priorityBadgeClasses =
              ticket.priority === 'critical'
                ? 'bg-red-600 text-white animate-pulse'
                : ticket.priority === 'high'
                ? 'bg-red-100 text-red-800'
                : ticket.priority === 'medium'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-zinc-100 text-zinc-700';

            const statusBadgeClasses =
              ticket.status === 'resolved' || ticket.status === 'closed'
                ? 'bg-emerald-100 text-emerald-800'
                : ticket.status === 'in_progress'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-red-100 text-red-800 font-bold';

            const isEditingNotes = editingNotesId === ticket.id;

            return (
              <div
                key={ticket.id}
                className="bg-white p-5 rounded-2xl border border-[#E7E0D5] shadow-xs hover:border-[#C5A059] transition-all space-y-3"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F3ECE2] pb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold bg-[#1C1917] text-[#C5A059] px-2.5 py-1 rounded-md">
                      {ticket.ticket_number}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${priorityBadgeClasses}`}>
                      {ticket.priority} priority
                    </span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusBadgeClasses}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-[#78716C] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E7E0D5]">
                      Category: {ticket.category.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-right text-[11px] text-[#78716C] font-mono">
                    {new Date(ticket.created_at).toLocaleString()}
                  </div>
                </div>

                {/* Ticket Title & Description */}
                <div>
                  <h3 className="font-serif-luxury text-base font-bold text-[#1C1917]">
                    {ticket.title}
                  </h3>
                  <p className="text-xs text-[#57534E] mt-1 whitespace-pre-line leading-relaxed">
                    {ticket.description}
                  </p>
                </div>

                {/* Submitter & Location Info */}
                <div className="text-xs bg-[#FAF7F2] p-3 rounded-xl border border-[#E7E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] text-[#78716C]">
                      Submitted by:{' '}
                      <strong className="text-[#1C1917]">{ticket.submitter_name}</strong> ({ticket.submitter_email})
                    </span>
                    {ticket.submitter_phone && (
                      <span className="text-[11px] text-[#78716C] ml-2">
                        • Tel: <strong className="text-[#1C1917] font-mono">{ticket.submitter_phone}</strong>
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#78716C]">
                    Screen / Route: <span className="font-mono font-semibold text-[#722F37]">{ticket.screen_url || '/admin'}</span>
                  </div>
                </div>

                {/* Resolution Notes Display or Editor */}
                {isPranay || isSuperAdmin ? (
                  <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Resolution / Engineering Notes (Pranay):</span>
                      </span>
                      {!isEditingNotes && (
                        <button
                          type="button"
                          onClick={() => setEditingNotesId(ticket.id)}
                          className="text-[11px] text-emerald-800 underline font-semibold hover:text-emerald-950 cursor-pointer"
                        >
                          {ticket.resolution_notes ? 'Edit Notes' : '+ Add Resolution Notes'}
                        </button>
                      )}
                    </div>

                    {isEditingNotes ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          rows={3}
                          value={activeNotesDraft[ticket.id] ?? (ticket.resolution_notes || '')}
                          onChange={(e) =>
                            setActiveNotesDraft((prev) => ({
                              ...prev,
                              [ticket.id]: e.target.value,
                            }))
                          }
                          placeholder="Type what was resolved or instructions for the submitter..."
                          className="w-full text-xs p-2.5 rounded-lg border border-emerald-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingNotesId(null)}
                            className="px-3 py-1 rounded-lg border border-emerald-300 text-emerald-900 text-xs font-semibold hover:bg-white cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveNotes(ticket.id)}
                            disabled={savingNoteId === ticket.id}
                            className="px-3.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            {savingNoteId === ticket.id ? 'Saving...' : 'Save Notes'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-emerald-900 italic">
                        {ticket.resolution_notes || 'No resolution notes logged yet.'}
                      </p>
                    )}
                  </div>
                ) : ticket.resolution_notes ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Resolution from Gexart Technical Support:</span>
                    </span>
                    <p className="leading-relaxed">{ticket.resolution_notes}</p>
                  </div>
                ) : null}

                {/* Bottom Controls / Action Bar */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white border-t border-[#F3ECE2] pt-3">
                  <div className="text-[11px] text-[#78716C] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Desk: Gexart Technical Support</span>
                  </div>

                  {/* Actions for Pranay / Tech Lead */}
                  {isPranay || isSuperAdmin ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Status Dropdown */}
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value as TicketStatus)}
                        className="text-xs py-1.5 px-2.5 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] text-[#1C1917] font-semibold focus:outline-none"
                      >
                        <option value="open">Status: Open</option>
                        <option value="in_progress">Status: In Progress</option>
                        <option value="resolved">Status: Resolved</option>
                        <option value="closed">Status: Closed</option>
                      </select>

                      {/* Reply to Submitter via Email */}
                      <a
                        href={replyMailtoUrl}
                        className="px-3 py-1.5 rounded-lg bg-[#1C1917] hover:bg-[#2E2825] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title={`Reply to ${ticket.submitter_email}`}
                      >
                        <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Reply to {ticket.submitter_name.split(' ')[0]}</span>
                      </a>

                      {/* WhatsApp Reply (if phone provided) */}
                      {ticket.submitter_phone && (
                        <a
                          href={replyWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          title="Quick reply on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      {/* Quick Resolve & Reply */}
                      {ticket.status !== 'resolved' && (
                        <button
                          type="button"
                          onClick={() => handleQuickResolveAndReply(ticket)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#722F37] to-[#8C3A44] hover:from-[#5C1D24] hover:to-[#722F37] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          title="Mark resolved and open email reply"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span>Resolve &amp; Reply</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Regular Staff View Actions */
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:pranay@gexart.com?subject=Follow-up%20on%20Support%20Ticket%20%23${ticket.ticket_number}`}
                        className="px-3 py-1.5 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] hover:bg-white text-[#1C1917] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#722F37]" />
                        <span>Send Follow-up to Support</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Quick Action Modal */}
      <RaiseTicketModal
        isOpen={showRaiseModal}
        onClose={() => setShowRaiseModal(false)}
        onTicketCreated={() => {
          fetchTickets();
        }}
      />
    </div>
  );
}
