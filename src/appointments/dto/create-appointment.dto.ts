import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, IsUUID, IsOptional, IsPhoneNumber } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Nome do cliente',
    example: 'João Silva',
  })
  @IsNotEmpty()
  @IsString()
  clientName: string;

  @ApiProperty({
    description: 'Telefone do cliente',
    example: '+5511999999999',
  })
  @IsNotEmpty()
  @IsString()
  clientPhone: string;

  @ApiProperty({
    description: 'Data e horário de início do agendamento',
    example: '2025-09-25T14:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  appointmentDateStart: string;

  @ApiProperty({
    description: 'Data e horário de término do agendamento',
    example: '2025-09-25T15:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  appointmentDateEnd: string;

  @ApiProperty({
    description: 'ID do serviço a ser realizado',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  serviceId: string;

  @ApiPropertyOptional({
    description: 'ID do funcionário preferido para realizar o atendimento',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  employeeId?: string;
}