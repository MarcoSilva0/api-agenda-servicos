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
    description: 'Se o serviço veio do ramo de atividade',
    example: true,
  })
  isFromActivityBranch: boolean;

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