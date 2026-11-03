import { getDoc, listDocs, putDoc } from '@/lib/db';
import { ticketColumns } from '@/lib/db/rows';
import {
  TicketCategory,
  TicketPriority,
  TicketStatus,
  SupportTicket,
  buildTicketMailtoUrl,
} from '@/types/tickets';

export type { TicketCategory, TicketPriority, TicketStatus, SupportTicket };
export { buildTicketMailtoUrl };

const DEFAULT_TARGET_EMAIL = 'pranay@gexart.com';

export async function getAllTickets(): Promise<SupportTicket[]> {
  return listDocs<SupportTicket>('support_tickets', 'created_at DESC');
}

export async function createTicket(
  ticketData: Omit<SupportTicket, 'id' | 'ticket_number' | 'created_at' | 'updated_at' | 'status' | 'target_email'>
): Promise<SupportTicket> {
  const timestamp = Date.now();
  const ticketNumber = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const newTicket: SupportTicket = {
    ...ticketData,
    id: `ticket-${timestamp}`,
    ticket_number: ticketNumber,
    target_email: DEFAULT_TARGET_EMAIL,
    status: 'open',
    created_at: now,
    updated_at: now,
    email_dispatched: true,
  };

  await putDoc('support_tickets', newTicket.id, ticketColumns(newTicket), newTicket);
  return newTicket;
}

export async function updateTicketStatus(
  id: string,
  status: TicketStatus,
  resolutionNotes?: string
): Promise<SupportTicket | null> {
  const current = await getDoc<SupportTicket>('support_tickets', id);
  if (!current) return null;

  const updated: SupportTicket = {
    ...current,
    status,
    resolution_notes: resolutionNotes !== undefined ? resolutionNotes : current.resolution_notes,
    updated_at: new Date().toISOString(),
  };

  await putDoc('support_tickets', id, ticketColumns(updated), updated);
  return updated;
}
