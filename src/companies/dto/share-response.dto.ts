import { ApiProperty } from '@nestjs/swagger';

export class ShareTemplateResponseDto {
  @ApiProperty({
    description: 'Template atual para compartilhamento',
    example: 'Obrigado por escolher {companyName}!\n\nAtendimento realizado:\nData: {attendanceDate}\nServiços: {services}\nCliente: {clientName}\nTelefone: {clientPhone}',
  })
  customShareTemplate: string;

  @ApiProperty({
    description: 'Template padrão do sistema',
    example: 'Atendimento realizado por {companyName}\n\nData: {attendanceDate}\nServiços: {services}\nCliente: {clientName}',
  })
  defaultTemplate: string;

  @ApiProperty({
    description: 'Variáveis disponíveis para uso no template',
    type: [String],
    example: ['{companyName}', '{attendanceDate}', '{services}', '{clientName}', '{clientPhone}'],
  })
  availableVariables: string[];
}

export class AttendanceShareResponseDto {
  @ApiProperty({
    description: 'Texto formatado pronto para compartilhamento',
    example: 'Obrigado por escolher Salão da Maria!\n\nAtendimento realizado:\nData: 25/09/2025\nServiços: Corte de cabelo, Manicure\nCliente: João Silva\nTelefone: (16) 99999-9999',
  })
  shareText: string;

  @ApiProperty({
    description: 'ID do atendimento compartilhado',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  attendanceId: string;

  @ApiProperty({
    description: 'Data/hora do compartilhamento',
    example: '2025-09-25T15:30:00.000Z',
  })
  sharedAt: Date;
}