import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum ThemePreference {
  SYSTEM = 'SYSTEM',
  LIGHT = 'LIGHT',
  DARK = 'DARK',
}

export class UpdateThemeDto {
  @ApiProperty({
    description: 'Preferência de tema do usuário',
    enum: ThemePreference,
    example: ThemePreference.DARK,
  })
  @IsEnum(ThemePreference)
  themePreference: ThemePreference;
}