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
  createdAt: string;
}
