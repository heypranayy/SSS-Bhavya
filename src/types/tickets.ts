export type TicketCategory =
  | 'bug_glitch'
  | 'catalog_issue'
  | 'inquiry_whatsapp'
  | 'inventory_pricing'
  | 'feature_request'
  | 'urgent_outage';

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  ticket_number: string;
  title: string;
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
  screen_url?: string;
  submitter_name: string;
  submitter_email: string;
  submitter_phone?: string;
  target_email: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  resolution_notes?: string;
  email_dispatched?: boolean;
}

export function buildTicketMailtoUrl(ticket: SupportTicket): string {
  const target = ticket.target_email || 'pranay@gexart.com';
  const subject = encodeURIComponent(
    `[Bhavya Support Ticket #${ticket.ticket_number}] [${ticket.priority.toUpperCase()}] ${ticket.title}`
  );

  const body = encodeURIComponent(
`Hi Pranay,

A support ticket has been raised by the Bhavya Fashions team.

--------------------------------------------------
TICKET NUMBER : ${ticket.ticket_number}
PRIORITY      : ${ticket.priority.toUpperCase()}
CATEGORY      : ${ticket.category.toUpperCase().replace('_', ' ')}
SUBMITTER     : ${ticket.submitter_name} (${ticket.submitter_email})
PHONE         : ${ticket.submitter_phone || 'N/A'}
PAGE / SCREEN : ${ticket.screen_url || '/admin'}
CREATED AT    : ${new Date(ticket.created_at).toLocaleString()}
--------------------------------------------------

ISSUE SUMMARY:
${ticket.title}

DETAILED DESCRIPTION:
${ticket.description}

--------------------------------------------------
Notification automatically addressed to: ${target}
Gexart Technical Support Helpdesk`
  );

  return `mailto:${target}?subject=${subject}&body=${body}`;
}

export function buildReplyToSubmitterMailtoUrl(ticket: SupportTicket, customNotes?: string): string {
  const subject = encodeURIComponent(
    `Re: [Gexart Support Ticket #${ticket.ticket_number}] ${ticket.title}`
  );

  const notes = customNotes?.trim() || ticket.resolution_notes?.trim() || 'Your issue has been reviewed and resolved.';
  const body = encodeURIComponent(
`Hi ${ticket.submitter_name},

Regarding your Gexart Support ticket #${ticket.ticket_number} ("${ticket.title}"):

${notes}

If you have any further questions, please feel free to reply directly to this email.

---
Best regards,
Pranay
Gexart Technical Support Desk
pranay@gexart.com`
  );

  return `mailto:${ticket.submitter_email}?subject=${subject}&body=${body}`;
}

export function buildReplyToSubmitterWhatsAppUrl(ticket: SupportTicket, customNotes?: string): string {
  const cleanPhone = (ticket.submitter_phone || '').replace(/[^0-9]/g, '');
  const notes = customNotes?.trim() || ticket.resolution_notes?.trim() || 'Your ticket has been reviewed and updated.';
  const text = `Hi ${ticket.submitter_name}, this is Pranay from Gexart Technical Support regarding ticket #${ticket.ticket_number} (${ticket.title}).\n\n${notes}`;
  return `https://wa.me/${cleanPhone || '919830729210'}?text=${encodeURIComponent(text)}`;
}

