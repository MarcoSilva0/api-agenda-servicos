import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'Nome do colaborador',
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'URL da foto do colaborador',
    example: 'https://exemplo.com/foto-joao.jpg',
  })
  @IsString()
  @IsUrl()
  @IsOptional()
  photoUrl?: string;
}
