import { NextResponse } from 'next/server';
import {
  getAllTickets,
  createTicket,
  updateTicketStatus,
  buildTicketMailtoUrl,
  SupportTicket,
} from '@/lib/repository/tickets';

export async function GET() {
  try {
    const tickets = await getAllTickets();
    return NextResponse.json(tickets);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, category, priority, screen_url, submitter_name, submitter_email, submitter_phone } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Ticket title and description are required.' },
        { status: 400 }
      );
    }

    const newTicket = await createTicket({
      title: title.trim(),
      description: description.trim(),
      category: category || 'bug_glitch',
      priority: priority || 'medium',
      screen_url: screen_url || '/admin',
      submitter_name: submitter_name?.trim() || 'Bhavya Fashions Team',
      submitter_email: submitter_email?.trim() || 'sss@bhavyafashions.com',
      submitter_phone: submitter_phone?.trim() || '+91 98307 29210',
    });

    const mailtoUrl = buildTicketMailtoUrl(newTicket);

    // If Resend or email webhook environment variables are configured, attempt server dispatch
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Bhavya Fashions Desk <tickets@bhavyafashions.com>',
            to: ['pranay@gexart.com'],
            subject: `[Bhavya Support Ticket #${newTicket.ticket_number}] [${newTicket.priority.toUpperCase()}] ${newTicket.title}`,
            text: `Support ticket #${newTicket.ticket_number} raised by ${newTicket.submitter_name}:\n\n${newTicket.description}\n\nCategory: ${newTicket.category}\nPriority: ${newTicket.priority}\nScreen: ${newTicket.screen_url}`,
          }),
        });
      } catch (mailErr) {
        console.warn('Optional Resend email dispatch failed:', mailErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        ticket: newTicket,
        mailtoUrl,
        message: 'Ticket recorded and routed to pranay@gexart.com',
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Failed to create ticket:', err);
    return NextResponse.json({ error: err.message || 'Failed to create ticket' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, resolution_notes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'id and status are required' },
        { status: 400 }
      );
    }

    const updated = await updateTicketStatus(id, status, resolution_notes);
    if (!updated) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
