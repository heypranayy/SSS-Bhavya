import { describe, it, expect } from 'vitest';
import {
  getAllTickets,
  createTicket,
  updateTicketStatus,
  buildTicketMailtoUrl,
} from '../src/lib/repository/tickets';

describe('Support Tickets System', () => {
  it('should create a support ticket with target email pranay@gexart.com', async () => {
    const newTicket = await createTicket({
      title: 'Test Issue with Catalog PDF Export',
      category: 'catalog_issue',
      priority: 'high',
      description: 'PDF download is taking longer than expected for large 60-product lookbooks.',
      screen_url: '/admin/catalogs',
      submitter_name: 'Bhavya Testing Suite',
      submitter_email: 'sss@bhavyafashions.com',
      submitter_phone: '+91 98307 29210',
    });

    expect(newTicket.id).toBeDefined();
    expect(newTicket.ticket_number).toMatch(/^TKT-\d+/);
    expect(newTicket.target_email).toBe('pranay@gexart.com');
    expect(newTicket.status).toBe('open');
    expect(newTicket.priority).toBe('high');

    // Verify ticket in list
    const allTickets = await getAllTickets();
    const found = allTickets.find((t) => t.id === newTicket.id);
    expect(found).toBeDefined();
    expect(found?.title).toBe('Test Issue with Catalog PDF Export');

    // Verify Mailto URL generator
    const mailto = buildTicketMailtoUrl(newTicket);
    expect(mailto).toContain('mailto:pranay@gexart.com');
    expect(mailto).toContain(newTicket.ticket_number);

    // Update ticket status
    const updated = await updateTicketStatus(newTicket.id, 'in_progress', 'Pranay investigated the worker process.');
    expect(updated?.status).toBe('in_progress');
    expect(updated?.resolution_notes).toContain('Pranay investigated');
  });
});
