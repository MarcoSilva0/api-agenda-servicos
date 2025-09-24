import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class UpdateAttendanceDto {
  @ApiProperty({
    description: 'Array de IDs dos serviços a serem realizados no atendimento',
    type: [String],
    example: ['f47ac10b-58cc-4372-a567-0e02b2c3d479'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(4, { each: true })
  serviceIds?: string[];

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

export class AddAttendanceServiceDto {
  @ApiProperty({
    description: 'ID do serviço a ser adicionado ao atendimento',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsUUID()
  serviceId: string;

  @ApiProperty({
    description: 'ID do funcionário que realizará o serviço',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  employeeId?: string;
}