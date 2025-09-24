import { IsOptional, IsString, IsDateString, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({
    description: 'Nome completo do cliente',
    example: 'João Silva Santos',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Telefone do cliente',
    example: '(11) 99999-9999',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Email do cliente',
    example: 'joao@email.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    description: 'Endereço do cliente',
    example: 'Rua das Flores, 123, Centro',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateClientDto {
  @ApiProperty({
    description: 'Nome completo do cliente',
    example: 'João Silva Santos',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Telefone do cliente',
    example: '(11) 99999-9999',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Email do cliente',
    example: 'joao@email.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    description: 'Endereço do cliente',
    example: 'Rua das Flores, 123, Centro',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;
}

export class ClientReportQueryDto {
  @ApiProperty({
    description: 'Página para paginação',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiProperty({
    description: 'Quantidade de itens por página',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiProperty({
    description: 'Filtrar por nome do cliente',
    example: 'João',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Data de início do período (YYYY-MM-DD)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Data final do período (YYYY-MM-DD)',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Filtrar por mês específico (1-12)',
    example: 9,
    required: false,
  })
  @IsOptional()
  @IsString()
  month?: string;

  @ApiProperty({
    description: 'Filtrar por ano específico',
    example: 2024,
    required: false,
  })
  @IsOptional()
  @IsString()
  year?: string;
}

export class ClientResponseDto {
  @ApiProperty({ description: 'ID único do cliente' })
  id: string;

  @ApiProperty({ description: 'Nome do cliente' })
  name: string;

  @ApiProperty({ description: 'Telefone do cliente' })
  phone: string;

  @ApiProperty({ description: 'Email do cliente', required: false })
  email?: string;

  @ApiProperty({ description: 'Endereço do cliente', required: false })
  address?: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  updatedAt: Date;

  @ApiProperty({ description: 'Data do último atendimento', required: false })
  lastAttendance?: Date;

  @ApiProperty({ description: 'Total de atendimentos', required: false })
  totalAttendances?: number;
}

export class ClientReportResponseDto {
  @ApiProperty({ description: 'Lista de clientes', type: [ClientResponseDto] })
  clients: ClientResponseDto[];

  @ApiProperty({ description: 'Total de clientes encontrados' })
  total: number;

  @ApiProperty({ description: 'Página atual' })
  currentPage: number;

  @ApiProperty({ description: 'Total de páginas' })
  totalPages: number;

  @ApiProperty({ description: 'Itens por página' })
  itemsPerPage: number;
}