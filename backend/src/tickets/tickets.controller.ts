import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Register for an event (create ticket)' })
  @ApiResponse({ status: 201, description: 'Ticket successfully created' })
  @ApiResponse({ status: 400, description: 'Event full or already registered' })
  @ApiResponse({ status: 409, description: 'Already registered for this event' })
  create(@Body() createTicketDto: CreateTicketDto, @CurrentUser() user?: User) {
    return this.ticketsService.create(createTicketDto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all tickets with optional filters' })
  @ApiQuery({ name: 'eventId', required: false, description: 'Filter by event ID' })
  @ApiQuery({ name: 'attendeeId', required: false, description: 'Filter by attendee ID' })
  @ApiResponse({ status: 200, description: 'List of tickets' })
  findAll(
    @Query('eventId') eventId?: string,
    @Query('attendeeId') attendeeId?: string,
    @CurrentUser() user?: User,
  ) {
    // If user is attendee, only show their tickets
    if (user?.role === UserRole.ATTENDEE && !attendeeId) {
      attendeeId = user.id;
    }
    return this.ticketsService.findAll(eventId, attendeeId);
  }

  @Get('verify/:ticketCode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify and check-in a ticket (Organizer/Admin only)' })
  @ApiResponse({ status: 200, description: 'Ticket successfully verified and checked in' })
  @ApiResponse({ status: 400, description: 'Ticket already checked in or event not started' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  verifyTicket(@Param('ticketCode') ticketCode: string) {
    return this.ticketsService.verifyTicket(ticketCode);
  }

  @Get('code/:ticketCode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  findByTicketCode(@Param('ticketCode') ticketCode: string) {
    return this.ticketsService.findByTicketCode(ticketCode);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() user?: User) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
}
