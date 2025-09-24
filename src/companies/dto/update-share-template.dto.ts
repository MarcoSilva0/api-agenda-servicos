import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateShareTemplateDto {
  @ApiProperty({
    description: 'Template personalizado para compartilhamento',
    example: 'Obrigado por escolher {companyName}!\n\nAtendimento realizado:\nData: {attendanceDate}\nServiços: {services}\nCliente: {clientName}\nTelefone: {clientPhone}',
  })
  @IsString()
  @IsNotEmpty()
  customShareTemplate: string;
}