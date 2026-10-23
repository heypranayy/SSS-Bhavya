import fs from 'fs';
import path from 'path';
import { getFirebaseDb, isFirebaseConfigured, sanitizeForFirestore } from '@/lib/firebase/config';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
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

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-init-001',
    ticket_number: 'TKT-1001',
    title: 'Platform Handover & Initial Production Verification',
    category: 'bug_glitch',
    priority: 'medium',
    description: 'Initial B2B Wholesale deployment completed for Bhavya Fashions. System check and verification tickets active.',
    screen_url: '/admin',
    submitter_name: 'Bhavya Fashions Operations Desk',
    submitter_email: 'sss@bhavyafashions.com',
    submitter_phone: '+91 98307 29210',
    target_email: 'pranay@gexart.com',
    status: 'resolved',
    resolution_notes: 'All core features verified. Category routing, WhatsApp inquiry drawer, and mobile design drawer active.',
    created_at: '2026-10-23T10:00:00.000Z',
    updated_at: '2026-10-23T11:00:00.000Z',
    email_dispatched: true,
  },
];

function getTicketsFilePath(): string {
  return path.join(process.cwd(), 'src', 'lib', 'data', 'support-tickets.json');
}

export function loadPersistedTickets(): SupportTicket[] {
  try {
    const filePath = getTicketsFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      if (data.trim()) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('Failed to read support tickets file:', err);
  }
  return INITIAL_TICKETS;
}

export function savePersistedTickets(tickets: SupportTicket[]): void {
  try {
    const filePath = getTicketsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(tickets, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write support tickets file:', err);
  }
}

export async function getAllTickets(): Promise<SupportTicket[]> {
  // 1. Try Firebase Firestore
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        const snap = await getDocs(collection(db, 'support_tickets'));
        if (!snap.empty) {
          const list: SupportTicket[] = [];
          snap.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          return list;
        }
      }
    } catch (err) {
      console.warn('Firebase support tickets fetch fallback to local:', err);
    }
  }

  // 2. Fallback to local persisted tickets
  const localList = loadPersistedTickets();
  return [...localList].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createTicket(
  ticketData: Omit<SupportTicket, 'id' | 'ticket_number' | 'created_at' | 'updated_at' | 'status' | 'target_email'>
): Promise<SupportTicket> {
  const tickets = loadPersistedTickets();
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

  tickets.unshift(newTicket);
  savePersistedTickets(tickets);

  // Sync to Firebase
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        const ref = doc(db, 'support_tickets', newTicket.id);
        await setDoc(ref, sanitizeForFirestore(newTicket), { merge: true });
      }
    } catch (err) {
      console.error('Failed to save ticket to Firebase:', err);
    }
  }

  return newTicket;
}

export async function updateTicketStatus(
  id: string,
  status: TicketStatus,
  resolutionNotes?: string
): Promise<SupportTicket | null> {
  const tickets = loadPersistedTickets();
  const index = tickets.findIndex((t) => t.id === id);
  if (index === -1) return null;

  tickets[index] = {
    ...tickets[index],
    status,
    resolution_notes: resolutionNotes !== undefined ? resolutionNotes : tickets[index].resolution_notes,
    updated_at: new Date().toISOString(),
  };

  savePersistedTickets(tickets);

  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        const ref = doc(db, 'support_tickets', id);
        await updateDoc(ref, sanitizeForFirestore({
          status,
          resolution_notes: tickets[index].resolution_notes,
          updated_at: tickets[index].updated_at,
        }));
      }
    } catch (err) {
      console.error('Failed to update ticket in Firebase:', err);
    }
  }

  return tickets[index];
}


