import { ApiProperty } from '@nestjs/swagger';
import { AppointmentResponseDto } from './appointment-response.dto';

export class CalendarDayDto {
  @ApiProperty({
    description: 'Data do dia',
    example: '2025-09-25',
  })
  date: string;

  @ApiProperty({
    description: 'Total de agendamentos do dia',
    example: 5,
  })
  totalAppointments: number;

  @ApiProperty({
    description: 'Lista de agendamentos do dia ordenados por horário',
    type: [AppointmentResponseDto],
  })
  appointments: AppointmentResponseDto[];

  @ApiProperty({
    description: 'Quantidade de agendamentos em atraso',
    example: 1,
  })
  overdueCount: number;
}

export class CalendarResponseDto {
  @ApiProperty({
    description: 'Lista de dias com agendamentos',
    type: [CalendarDayDto],
  })
  days: CalendarDayDto[];

  @ApiProperty({
    description: 'Total de agendamentos no período',
    example: 25,
  })
  totalAppointments: number;

  @ApiProperty({
    description: 'Total de dias com agendamentos',
    example: 5,
  })
  totalDays: number;
}