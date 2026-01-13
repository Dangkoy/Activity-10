import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

export enum TicketStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CANCELLED = 'cancelled',
}

@Entity('tickets')
@Unique(['eventId', 'attendeeId'])
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  ticketCode: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.CONFIRMED,
  })
  status: TicketStatus;

  @Column({ nullable: true })
  qrCode: string;

  @Column({ type: 'datetime', nullable: true })
  checkedInAt: Date;

  @ManyToOne(() => Event, (event) => event.tickets)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  eventId: string;

  @ManyToOne(() => User, (user) => user.tickets)
  @JoinColumn({ name: 'attendeeId' })
  attendee: User;

  @Column()
  attendeeId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
