import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('events/:eventId/attendees/csv')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: 'Export attendees list as CSV (Admin/Organizer only)' })
  @ApiResponse({ status: 200, description: 'CSV file download', type: 'text/csv' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async exportAttendeesCSV(
    @Param('eventId') eventId: string,
    @Res() res: Response,
    @CurrentUser() user: User,
  ) {
    const csv = await this.reportsService.exportAttendeesCSV(eventId, user);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendees-${eventId}.csv"`);
    res.send(csv);
  }

  @Get('events/:eventId/statistics')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: 'Get event statistics (Admin/Organizer only)' })
  @ApiResponse({ status: 200, description: 'Event statistics' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async getEventStatistics(
    @Param('eventId') eventId: string,
    @CurrentUser() user: User,
  ) {
    return this.reportsService.getEventStatistics(eventId, user);
  }

  @Get('overview')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get system overview statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'System overview statistics' })
  async getOverviewStatistics(@CurrentUser() user: User) {
    return this.reportsService.getOverviewStatistics();
  }
}
