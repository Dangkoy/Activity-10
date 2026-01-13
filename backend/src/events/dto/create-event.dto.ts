import { IsString, IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  location: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @Min(1)
  capacity: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
