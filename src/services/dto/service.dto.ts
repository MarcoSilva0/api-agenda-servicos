import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({
    description: 'Nome do serviço',
    example: 'Corte de cabelo',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Descrição do serviço',
    example: 'Corte de cabelo masculino e feminino',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Se o serviço é favorito',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean = false;
}

export class UpdateServiceDto {
  @ApiPropertyOptional({
    description: 'Nome do serviço',
    example: 'Corte de cabelo premium',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Descrição do serviço',
    example: 'Corte de cabelo masculino e feminino com tratamento',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Se o serviço é favorito',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @ApiPropertyOptional({
    description: 'Se o serviço está ativo (disponível para agendamento)',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ImportServicesDto {
  @ApiProperty({
    description: 'ID do ramo de atividade',
    example: 'uuid-string',
  })
  @IsUUID()
  @IsNotEmpty()
  activityBranchId: string;
}

export class SelectiveImportServicesDto {
  @ApiProperty({
    description: 'ID do ramo de atividade',
    example: 'uuid-string',
  })
  @IsUUID()
  @IsNotEmpty()
  activityBranchId: string;

  @ApiProperty({
    description: 'IDs dos serviços padrão para importar',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
    type: [String],
  })
  @IsUUID(4, { each: true })
  @IsNotEmpty()
  defaultServiceIds: string[];
}

export class CsvImportResultDto {
  @ApiProperty({
    description: 'Número de serviços importados com sucesso',
    example: 5,
  })
  imported: number;

  @ApiProperty({
    description: 'Número de serviços que falharam na importação',
    example: 2,
  })
  failed: number;

  @ApiProperty({
    description: 'Lista de erros encontrados durante a importação',
    example: ['Linha 3: Nome é obrigatório', 'Linha 7: Descrição é obrigatória'],
    type: [String],
  })
  errors: string[];

  @ApiProperty({
    description: 'Mensagem de resumo da importação',
    example: '5 serviços importados, 2 falharam',
  })
  message: string;
}

export class DefaultServiceResponseDto {
  @ApiProperty({
    description: 'ID do serviço padrão',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do serviço',
    example: 'Corte de cabelo',
  })
  name: string;

  @ApiProperty({
    description: 'Descrição do serviço',
    example: 'Corte de cabelo masculino e feminino',
  })
  description: string;

  @ApiProperty({
    description: 'Se é favorito por padrão',
    example: true,
  })
  isFavoriteDefault: boolean;

  @ApiProperty({
    description: 'Se já foi importado pela empresa',
    example: false,
  })
  alreadyImported: boolean;
}

export class ServiceResponseDto {
  @ApiProperty({
    description: 'ID do serviço',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do serviço',
    example: 'Corte de cabelo',
  })
  name: string;

  @ApiProperty({
    description: 'Descrição do serviço',
    example: 'Corte de cabelo masculino e feminino',
  })
  description: string;

  @ApiProperty({
    description: 'Se o serviço é favorito',
    example: false,
  })
  isFavorite: boolean;

  @ApiProperty({
    description: 'Se o serviço está ativo na empresa',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Se o serviço veio do ramo de atividade',
    example: true,
  })
  isFromActivityBranch: boolean;

  @ApiProperty({
    description: 'Se é um serviço padrão do sistema',
    example: false,
  })
  isSystemDefault: boolean;

  @ApiProperty({
    description: 'Data de criação',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}