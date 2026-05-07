import { User, Ticket } from './types';

export const mockUsers: User[] = [
  {
    id: 'emp-123',
    email: 'employee@demo.com',
    name: 'Alice Employee',
    role: 'EMPLOYEE',
  },
  {
    id: 'rev-456',
    email: 'reviewer@demo.com',
    name: 'Bob Reviewer',
    role: 'REVIEWER',
  },
];

// Global in-memory tickets array
declare global {
  var __tickets: Ticket[] | undefined;
}

if (!global.__tickets) {
  global.__tickets = [];
}

export const mockDb = {
  get users() {
    return mockUsers;
  },
  get tickets() {
    return global.__tickets!;
  },
  addTicket(ticket: Ticket) {
    global.__tickets!.push(ticket);
  },
  updateTicket(id: string, updates: Partial<Ticket>) {
    const index = global.__tickets!.findIndex(t => t.id === id);
    if (index !== -1) {
      global.__tickets![index] = { ...global.__tickets![index], ...updates };
    }
  }
};
