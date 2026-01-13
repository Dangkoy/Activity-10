import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { EventsService } from '../events/events.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private eventsService: EventsService,
    private usersService: UsersService,
  ) {}

  async create(createTicketDto: CreateTicketDto, currentUser?: User): Promise<Ticket> {
    const event = await this.eventRepository.findOne({
      where: { id: createTicketDto.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!event.isActive) {
      throw new BadRequestException('Event is not active');
    }

    if (new Date(event.startDate) < new Date()) {
      throw new BadRequestException('Event has already started');
    }

    // Check capacity
    if (event.registeredCount >= event.capacity) {
      throw new BadRequestException('Event is at full capacity');
    }

    // Find or create attendee
    let attendee = await this.userRepository.findOne({
      where: { email: createTicketDto.email },
    });

    if (!attendee) {
      // Create attendee account with random password
      const tempPassword = uuidv4();
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      attendee = this.userRepository.create({
        email: createTicketDto.email,
        password: hashedPassword,
        fullName: createTicketDto.fullName,
        company: createTicketDto.company,
        role: 'attendee' as any,
      });
      attendee = await this.userRepository.save(attendee);
    } else if (currentUser && attendee.id !== currentUser.id) {
      throw new ConflictException('Email already registered to another account');
    }

    // Check for duplicate registration
    const existingTicket = await this.ticketRepository.findOne({
      where: {
        eventId: event.id,
        attendeeId: attendee.id,
      },
    });

    if (existingTicket) {
      if (existingTicket.status === TicketStatus.CANCELLED) {
        // Reactivate cancelled ticket
        existingTicket.status = TicketStatus.CONFIRMED;
        existingTicket.qrCode = await this.generateQRCode(existingTicket.ticketCode);
        await this.eventsService.incrementRegisteredCount(event.id);
        return this.ticketRepository.save(existingTicket);
      }
      throw new ConflictException('Already registered for this event');
    }

    // Generate unique ticket code
    const ticketCode = `${event.id.substring(0, 8)}-${uuidv4().substring(0, 8)}-${Date.now().toString(36).toUpperCase()}`;

    // Generate QR code
    const qrCode = await this.generateQRCode(ticketCode);

    const ticket = this.ticketRepository.create({
      ticketCode,
      qrCode,
      eventId: event.id,
      attendeeId: attendee.id,
      status: TicketStatus.CONFIRMED,
    });

    const savedTicket = await this.ticketRepository.save(ticket);
    await this.eventsService.incrementRegisteredCount(event.id);

    return this.ticketRepository.findOne({
      where: { id: savedTicket.id },
      relations: ['event', 'attendee'],
    });
  }

  async findAll(eventId?: string, attendeeId?: string): Promise<Ticket[]> {
    const where: any = {};
    if (eventId) where.eventId = eventId;
    if (attendeeId) where.attendeeId = attendeeId;

    return this.ticketRepository.find({
      where,
      relations: ['event', 'attendee'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['event', 'attendee'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async findByTicketCode(ticketCode: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { ticketCode },
      relations: ['event', 'attendee'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async verifyTicket(ticketCode: string): Promise<Ticket> {
    const ticket = await this.findByTicketCode(ticketCode);

    if (ticket.status === TicketStatus.CANCELLED) {
      throw new BadRequestException('Ticket has been cancelled');
    }

    if (ticket.status === TicketStatus.CHECKED_IN) {
      throw new BadRequestException('Ticket already checked in');
    }

    // Check if event has started
    const event = ticket.event;
    if (new Date(event.startDate) > new Date()) {
      throw new BadRequestException('Event has not started yet');
    }

    ticket.status = TicketStatus.CHECKED_IN;
    ticket.checkedInAt = new Date();

    return this.ticketRepository.save(ticket);
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (updateTicketDto.status === TicketStatus.CANCELLED && ticket.status !== TicketStatus.CANCELLED) {
      // Decrement registered count when cancelling
      await this.eventsService.decrementRegisteredCount(ticket.eventId);
    } else if (ticket.status === TicketStatus.CANCELLED && updateTicketDto.status !== TicketStatus.CANCELLED) {
      // Increment when reactivating
      await this.eventsService.incrementRegisteredCount(ticket.eventId);
    }

    Object.assign(ticket, updateTicketDto);
    return this.ticketRepository.save(ticket);
  }

  async remove(id: string): Promise<void> {
    const ticket = await this.findOne(id);
    await this.eventsService.decrementRegisteredCount(ticket.eventId);
    await this.ticketRepository.remove(ticket);
  }

  private async generateQRCode(ticketCode: string): Promise<string> {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(ticketCode, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 1,
      });
      return qrCodeDataURL;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }
}
