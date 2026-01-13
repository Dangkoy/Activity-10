export interface User {
  id: string;
  email: string;
  fullName: string;
  company?: string;
  role: 'admin' | 'organizer' | 'attendee';
  isActive: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  registeredCount: number;
  isActive: boolean;
  imageUrl?: string;
  organizerId: string;
}

export interface Ticket {
  id: string;
  ticketCode: string;
  status: 'pending' | 'confirmed' | 'checked_in' | 'cancelled';
  qrCode: string;
  checkedInAt?: string;
  eventId: string;
  event?: Event;
  attendeeId: string;
  attendee?: User;
  createdAt: string;
}
