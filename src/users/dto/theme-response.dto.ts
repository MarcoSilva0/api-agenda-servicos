import { ApiProperty } from '@nestjs/swagger';

export class ThemeResponseDto {
  @ApiProperty({
    description: 'Preferência de tema atual do usuário',
    enum: ['SYSTEM', 'LIGHT', 'DARK'],
    example: 'DARK',
  })
  themePreference: string;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2025-09-25T10:00:00.000Z',
  })
  updatedAt: Date;
}