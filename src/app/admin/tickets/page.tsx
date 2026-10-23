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
} from 'lucide-react';
import { SupportTicket, TicketStatus, buildTicketMailtoUrl } from '@/types/tickets';
import { RaiseTicketModal } from '@/components/admin/RaiseTicketModal';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showRaiseModal, setShowRaiseModal] = useState(false);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/tickets');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setTickets(data);
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

  const handleStatusChange = async (id: string, newStatus: TicketStatus) => {
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setTickets((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t))
        );
      }
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E7E0D5] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#722F37]/10 text-[#722F37]">
              <LifeBuoy className="w-5 h-5" />
            </span>
            <h1 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">
              Tech Support &amp; Issue Tickets
            </h1>
          </div>
          <p className="text-xs text-[#78716C]">
            Direct engineering helpdesk. Every ticket automatically routes to{' '}
            <a
              href="mailto:pranay@gexart.com"
              className="text-[#722F37] font-semibold underline hover:text-[#C5A059]"
            >
              pranay@gexart.com
            </a>{' '}
            (Gexart Technologies Lead Developer).
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

          <a
            href="mailto:pranay@gexart.com?subject=Bhavya%20Fashions%20Direct%20Tech%20Inquiry"
            className="px-3.5 py-2.5 rounded-xl border border-[#E7E0D5] bg-white text-[#1C1917] hover:bg-[#FAF7F2] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Mail className="w-4 h-4 text-[#722F37]" />
            <span>Email Pranay Directly</span>
          </a>

          <button
            type="button"
            onClick={() => setShowRaiseModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#722F37] hover:bg-[#5C1D24] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Raise New Ticket</span>
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
      <div className="space-y-3">
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
              Raise a New Ticket
            </button>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const mailtoUrl = buildTicketMailtoUrl(ticket);

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

            return (
              <div
                key={ticket.id}
                className="bg-white p-5 rounded-2xl border border-[#E7E0D5] shadow-sm hover:border-[#C5A059] transition-all space-y-3"
              >
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

                <div>
                  <h3 className="font-serif-luxury text-base font-bold text-[#1C1917]">
                    {ticket.title}
                  </h3>
                  <p className="text-xs text-[#57534E] mt-1 whitespace-pre-line leading-relaxed">
                    {ticket.description}
                  </p>
                </div>

                {ticket.resolution_notes && (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900 space-y-1">
                    <span className="font-bold block">Resolution / Notes:</span>
                    <p>{ticket.resolution_notes}</p>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-[#FAF7F2] p-3 rounded-xl border border-[#E7E0D5]">
                  <div className="space-y-0.5">
                    <div className="text-[11px] text-[#78716C]">
                      Submitted by:{' '}
                      <strong className="text-[#1C1917]">{ticket.submitter_name}</strong> ({ticket.submitter_email})
                    </div>
                    <div className="text-[11px] text-[#78716C]">
                      Screen: <span className="font-mono">{ticket.screen_url || '/admin'}</span> • Target:{' '}
                      <strong className="text-[#722F37] font-mono">{ticket.target_email}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status dropdown */}
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value as TicketStatus)}
                      className="text-xs py-1.5 px-2.5 rounded-lg border border-[#E7E0D5] bg-white text-[#1C1917] font-semibold focus:outline-none"
                    >
                      <option value="open">Mark: Open</option>
                      <option value="in_progress">Mark: In Progress</option>
                      <option value="resolved">Mark: Resolved</option>
                      <option value="closed">Mark: Closed</option>
                    </select>

                    {/* Email Pranay Button */}
                    <a
                      href={mailtoUrl}
                      className="px-3 py-1.5 rounded-lg bg-[#722F37] text-white hover:bg-[#5C1D24] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Send ticket via email to pranay@gexart.com"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email Pranay</span>
                    </a>
                  </div>
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
