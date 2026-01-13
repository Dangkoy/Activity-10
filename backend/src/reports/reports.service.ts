import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as createCsvWriter from 'csv-writer';
import { Event } from '../events/entities/event.entity';
import { Ticket, TicketStatus } from '../tickets/entities/ticket.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async exportAttendeesCSV(eventId: string, user: User): Promise<string> {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Only admin or event organizer can export
    if (user.role !== UserRole.ADMIN && event.organizerId !== user.id) {
      throw new ForbiddenException('You do not have permission to export this data');
    }

    const tickets = await this.ticketRepository.find({
      where: { eventId },
      relations: ['attendee'],
      order: { createdAt: 'ASC' },
    });

    const csvRows = ['Name,Email,Company,Ticket Code,Status,Registered At,Checked In At'];

    for (const ticket of tickets) {
      const attendee = ticket.attendee;
      const row = [
        attendee.fullName || '',
        attendee.email || '',
        attendee.company || '',
        ticket.ticketCode || '',
        ticket.status || '',
        ticket.createdAt ? ticket.createdAt.toISOString() : '',
        ticket.checkedInAt ? ticket.checkedInAt.toISOString() : '',
      ].map((field) => `"${String(field).replace(/"/g, '""')}"`);
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }

  async getEventStatistics(eventId: string, user: User) {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Only admin or event organizer can view statistics
    if (user.role !== UserRole.ADMIN && event.organizerId !== user.id) {
      throw new ForbiddenException('You do not have permission to view this data');
    }

    const tickets = await this.ticketRepository.find({
      where: { eventId },
    });

    const totalRegistered = tickets.length;
    const checkedIn = tickets.filter((t) => t.status === TicketStatus.CHECKED_IN).length;
    const cancelled = tickets.filter((t) => t.status === TicketStatus.CANCELLED).length;
    const confirmed = tickets.filter((t) => t.status === TicketStatus.CONFIRMED).length;

    return {
      eventId,
      eventTitle: event.title,
      capacity: event.capacity,
      totalRegistered,
      confirmed,
      checkedIn,
      cancelled,
      remainingCapacity: event.capacity - totalRegistered + cancelled,
      checkInRate: totalRegistered > 0 ? ((checkedIn / (totalRegistered - cancelled)) * 100).toFixed(2) : '0',
    };
  }

  async getOverviewStatistics() {
    const totalEvents = await this.eventRepository.count();
    const activeEvents = await this.eventRepository.count({ where: { isActive: true } });
    const totalTickets = await this.ticketRepository.count();
    const checkedInTickets = await this.ticketRepository.count({
      where: { status: TicketStatus.CHECKED_IN },
    });
    const totalUsers = await this.userRepository.count();
    const organizers = await this.userRepository.count({ where: { role: UserRole.ORGANIZER } });
    const attendees = await this.userRepository.count({ where: { role: UserRole.ATTENDEE } });

    return {
      totalEvents,
      activeEvents,
      totalTickets,
      checkedInTickets,
      totalUsers,
      organizers,
      attendees,
    };
  }
}
