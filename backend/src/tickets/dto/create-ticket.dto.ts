import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  eventId: string;

  @IsEmail()
  email: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  company?: string;
}
