import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class CheckAvailabilityDto {
  @ApiProperty({
    description: 'Data e horário de início para verificar disponibilidade',
    example: '2025-09-25T14:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  @IsDateString()
  dateStart: string;

  @ApiProperty({
    description: 'Data e horário de término para verificar disponibilidade',
    example: '2025-09-25T15:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  @IsDateString()
  dateEnd: string;
}