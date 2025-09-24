import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateActivityBranchDto {
  @ApiProperty({
    description: 'Nome do ramo de atividade',
    example: 'Barbearia',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Descrição do ramo de atividade',
    example: 'Serviços de corte de cabelo e barba',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateActivityBranchDto {
  @ApiProperty({
    description: 'Nome do ramo de atividade',
    example: 'Barbearia Premium',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Descrição do ramo de atividade',
    example: 'Serviços premium de corte de cabelo e barba',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class ActivityBranchResponseDto {
  @ApiProperty({
    description: 'ID do ramo de atividade',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do ramo de atividade',
    example: 'Barbearia',
  })
  name: string;

  @ApiProperty({
    description: 'Descrição do ramo de atividade',
    example: 'Serviços de corte de cabelo e barba',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Data de criação',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}