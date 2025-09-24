import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { ThemeResponseDto } from './dto/theme-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getTheme(userId: string, requestingUserId: string): Promise<ThemeResponseDto> {
    // Verificar se o usuário está tentando acessar seu próprio tema ou é admin
    if (userId !== requestingUserId) {
      const requestingUser = await this.prisma.user.findUnique({
        where: { id: requestingUserId },
      });

      if (!requestingUser || (requestingUser.role !== 'OWNER' && requestingUser.role !== 'ADMIN')) {
        throw new ForbiddenException('Você não tem permissão para acessar o tema deste usuário');
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        themePreference: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      themePreference: user.themePreference,
      updatedAt: user.updatedAt,
    };
  }

  async updateTheme(userId: string, updateThemeDto: UpdateThemeDto, requestingUserId: string): Promise<ThemeResponseDto> {
    // Verificar se o usuário está tentando atualizar seu próprio tema ou é admin
    if (userId !== requestingUserId) {
      const requestingUser = await this.prisma.user.findUnique({
        where: { id: requestingUserId },
      });

      if (!requestingUser || (requestingUser.role !== 'OWNER' && requestingUser.role !== 'ADMIN')) {
        throw new ForbiddenException('Você não tem permissão para alterar o tema deste usuário');
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        themePreference: updateThemeDto.themePreference,
      },
      select: {
        themePreference: true,
        updatedAt: true,
      },
    });

    return {
      themePreference: updatedUser.themePreference,
      updatedAt: updatedUser.updatedAt,
    };
  }
}
