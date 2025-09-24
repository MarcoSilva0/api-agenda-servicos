import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateEmployeeDto {
  @ApiPropertyOptional({
    description: 'Nome do colaborador',
    example: 'João Silva Santos',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'URL da foto do colaborador',
    example: 'https://exemplo.com/nova-foto-joao.jpg',
  })
  @IsString()
  @IsUrl()
  @IsOptional()
  photoUrl?: string;
}
