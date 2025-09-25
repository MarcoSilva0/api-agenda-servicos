import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmployeeResponseDto {
  @ApiProperty({
    description: 'ID do colaborador',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'ID da empresa',
    example: 'uuid-string',
  })
  companyId: string;

  @ApiProperty({
    description: 'Nome do colaborador',
    example: 'João Silva',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'URL da foto do colaborador',
    example: 'https://exemplo.com/foto-joao.jpg',
  })
  photoUrl?: string;

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

  @ApiPropertyOptional({
    description: 'Serviços preferidos do colaborador',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
      },
    },
  })
  preferredServices?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}