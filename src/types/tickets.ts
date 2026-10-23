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
Bhavya Fashions Wholesale B2B Support Desk`
  );

  return `mailto:${target}?subject=${subject}&body=${body}`;
}
