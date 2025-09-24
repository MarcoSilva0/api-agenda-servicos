import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class CalendarQueryDto {
  @ApiProperty({
    description: 'Data inicial para busca (formato ISO 8601)',
    example: '2025-09-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Data final para busca (formato ISO 8601)',
    example: '2025-09-30T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class DateRangeDto {
  @ApiProperty({
    description: 'Data específica (formato YYYY-MM-DD)',
    example: '2025-09-25',
  })
  @IsDateString()
  date: string;
}