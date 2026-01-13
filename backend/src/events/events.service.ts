import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThan } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto, organizerId: string): Promise<Event> {
    const event = this.eventRepository.create({
      ...createEventDto,
      organizerId,
      registeredCount: 0,
    });

    return this.eventRepository.save(event);
  }

  async findAll(
    search?: string,
    upcoming?: boolean,
    organizerId?: string,
    isActive?: boolean,
  ): Promise<Event[]> {
    const where: any = {};

    if (organizerId) {
      where.organizerId = organizerId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (upcoming) {
      where.startDate = MoreThan(new Date());
    }

    const events = await this.eventRepository.find({
      where,
      relations: ['organizer'],
      order: { startDate: 'ASC' },
    });

    if (search) {
      const searchLower = search.toLowerCase();
      return events.filter(
        (event) =>
          event.title.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower),
      );
    }

    return events;
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['organizer', 'tickets', 'tickets.attendee'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    user: User,
  ): Promise<Event> {
    const event = await this.findOne(id);

    // Only admin or the organizer can update
    if (user.role !== UserRole.ADMIN && event.organizerId !== user.id) {
      throw new ForbiddenException('You do not have permission to update this event');
    }

    Object.assign(event, updateEventDto);
    return this.eventRepository.save(event);
  }

  async remove(id: string, user: User): Promise<void> {
    const event = await this.findOne(id);

    // Only admin or the organizer can delete
    if (user.role !== UserRole.ADMIN && event.organizerId !== user.id) {
      throw new ForbiddenException('You do not have permission to delete this event');
    }

    await this.eventRepository.remove(event);
  }

  async incrementRegisteredCount(eventId: string): Promise<void> {
    await this.eventRepository.increment({ id: eventId }, 'registeredCount', 1);
  }

  async decrementRegisteredCount(eventId: string): Promise<void> {
    await this.eventRepository.decrement({ id: eventId }, 'registeredCount', 1);
  }
}
