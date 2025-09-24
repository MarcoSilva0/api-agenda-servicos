import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({ description: 'ID único do usuário' })
  id: string;

  @ApiProperty({ description: 'Nome completo do usuário' })
  name: string;

  @ApiProperty({ description: 'Email do usuário' })
  email: string;

  @ApiProperty({ description: 'Telefone do usuário', required: false })
  phone?: string;

  @ApiProperty({ description: 'Papel do usuário', enum: ['OWNER', 'ADMIN', 'EMPLOYEE'] })
  role: string;

  @ApiProperty({ description: 'ID da empresa vinculada' })
  companyId: string;

  @ApiProperty({ description: 'Preferência de tema', enum: ['SYSTEM', 'LIGHT', 'DARK'] })
  themePreference: string;

  @ApiProperty({ description: 'Autenticação biométrica habilitada' })
  biometricAuthEnabled: boolean;

  @ApiProperty({ description: 'Email confirmado' })
  emailConfirmed: boolean;

  @ApiProperty({ description: 'Primeiro acesso completado' })
  firstAccessCompleted: boolean;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  updatedAt: Date;

  @ApiProperty({ description: 'Dados da empresa' })
  company: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    logoUrl?: string;
    customShareTemplate?: string;
    createdAt: Date;
  };
}