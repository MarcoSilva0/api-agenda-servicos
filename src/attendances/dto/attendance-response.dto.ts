import { ApiProperty } from '@nestjs/swagger';

export class AttendanceServiceResponseDto {
  @ApiProperty({
    description: 'ID único do serviço no atendimento',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  id: string;

  @ApiProperty({
    description: 'Dados do serviço',
    type: Object,
  })
  service: {
    id: string;
    name: string;
    description: string;
    isFavorite: boolean;
  };

  @ApiProperty({
    description: 'Funcionário responsável pelo serviço (se definido)',
    type: Object,
    nullable: true,
  })
  employee?: {
    id: string;
    name: string;
    photoUrl?: string;
  };
}

export class AttendanceResponseDto {
  @ApiProperty({
    description: 'ID único do atendimento',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  id: string;

  @ApiProperty({
    description: 'ID da empresa',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d478',
  })
  companyId: string;

  @ApiProperty({
    description: 'Dados do cliente',
    type: Object,
  })
  client: {
    id: string;
    name: string;
    phone: string;
  };

  @ApiProperty({
    description: 'Dados do agendamento original',
    type: Object,
  })
  appointment: {
    id: string;
    appointmentDateStart: Date;
    appointmentDateEnd: Date;
    status: string;
  };

  @ApiProperty({
    description: 'Data e hora do atendimento',
    example: '2025-09-25T14:30:00.000Z',
  })
  attendanceDate: Date;

  @ApiProperty({
    description: 'Horário do atendimento',
    example: '2025-09-25T14:30:00.000Z',
  })
  attendanceTime: Date;

  @ApiProperty({
    description: 'Data e hora de finalização do atendimento',
    example: '2025-09-25T15:30:00.000Z',
    nullable: true,
  })
  completedAt?: Date;

  @ApiProperty({
    description: 'Lista de serviços do atendimento',
    type: [AttendanceServiceResponseDto],
  })
  services: AttendanceServiceResponseDto[];

  @ApiProperty({
    description: 'Data de criação',
    example: '2025-09-25T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de última atualização',
    example: '2025-09-25T10:00:00.000Z',
  })
  updatedAt: Date;
}