import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from './update-appointment.dto';

export class AppointmentResponseDto {
  @ApiProperty({
    description: 'ID do agendamento',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'ID da empresa',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  companyId: string;

  @ApiProperty({
    description: 'Dados do cliente',
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      phone: { type: 'string' },
    },
  })
  client: {
    id: string;
    name: string;
    phone: string;
  };

  @ApiProperty({
    description: 'Dados do serviço',
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      description: { type: 'string' },
      isFavorite: { type: 'boolean' },
    },
  })
  service: {
    id: string;
    name: string;
    description: string;
    isFavorite: boolean;
  };

  @ApiPropertyOptional({
    description: 'Dados do funcionário (se especificado)',
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      photoUrl: { type: 'string', nullable: true },
    },
  })
  employee?: {
    id: string;
    name: string;
    photoUrl: string | null;
  };

  @ApiProperty({
    description: 'Data e horário de início do agendamento',
    example: '2025-09-25T14:30:00.000Z',
  })
  appointmentDateStart: Date;

  @ApiProperty({
    description: 'Data e horário de término do agendamento',
    example: '2025-09-25T15:30:00.000Z',
  })
  appointmentDateEnd: Date;

  @ApiProperty({
    description: 'Status do agendamento',
    enum: AppointmentStatus,
    example: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus;

  @ApiProperty({
    description: 'Data de criação',
    example: '2025-09-24T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2025-09-24T10:30:00.000Z',
  })
  updatedAt: Date;
}