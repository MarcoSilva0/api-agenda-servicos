import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsArray, ArrayMinSize } from 'class-validator';

export class CreateAttendanceDto {
  @ApiProperty({
    description: 'ID do agendamento que será convertido em atendimento',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsUUID()
  appointmentId: string;

  @ApiProperty({
    description: 'Array de IDs dos serviços a serem realizados no atendimento',
    type: [String],
    example: ['f47ac10b-58cc-4372-a567-0e02b2c3d479'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(4, { each: true })
  serviceIds: string[];

  @ApiProperty({
    description: 'Array de objetos relacionando funcionários aos serviços',
    type: [Object],
    example: [
      {
        serviceId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        employeeId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480'
      }
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  serviceEmployees?: Array<{
    serviceId: string;
    employeeId: string;
  }>;
}