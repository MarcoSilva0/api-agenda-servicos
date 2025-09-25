import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { 
  RegisterDto, 
  LoginDto, 
  ForgotPasswordDto, 
  ResetPasswordDto, 
  AuthResponseDto 
} from './dto/auth.dto';
import { ThemePreference } from '../../generated/prisma';
import { MailerService } from 'src/mailer/mailer.service';
import { EmailTemplateService } from 'src/core/email-template.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Verificar se o email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Criar empresa e usuário em uma transação
    const result = await this.prisma.$transaction(async (tx) => {
      // Criar empresa
      const company = await tx.company.create({
        data: {
          name: registerDto.companyName,
          email: registerDto.email,
          phone: registerDto.phone,
          address: registerDto.address,
          logoUrl: registerDto.logoUrl,
          activityBranchId: registerDto.activityBranchId.toString(),
        },
      });

      // Criar usuário
      const user = await tx.user.create({
        data: {
          companyId: company.id,
          name: registerDto.name,
          email: registerDto.email,
          passwordHash: hashedPassword,
          phone: registerDto.userPhone,
          role: registerDto.role || 'OWNER',
          themePreference: ThemePreference.SYSTEM,
        },
        include: {
          company: true,
        },
      });

      return { user, company };
    });

    // Gerar JWT
    const payload = { 
      sub: result.user.id, 
      email: result.user.email,
      name: result.user.name,
      companyId: result.user.companyId,
      role: result.user.role
    };
    const access_token = this.jwtService.sign(payload);

    try {
      const welcomeEmailContent = this.emailTemplateService.renderTemplate('welcome', {
        userName: result.user.name,
        companyName: result.company.name,
        loginUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
      });

      await this.mailerService.sendEmail(
        result.user.email,
        `🎉 Bem-vindo à ${result.company.name}!`,
        welcomeEmailContent,
      );
    } catch (error) {
      console.error('Erro ao enviar email de boas-vindas:', error);
      // Não bloquear o registro se o email falhar
    }
    
    return {
      access_token,
      user: {
        id: parseInt(result.user.id) || 0,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        companyId: parseInt(result.user.companyId) || 0,
        company: {
          id: parseInt(result.company.id) || 0,
          name: result.company.name,
          themePreference: 'SYSTEM',
        },
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Buscar usuário
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        company: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gerar JWT
    const payload = { 
      sub: user.id, 
      email: user.email,
      name: user.name,
      companyId: user.companyId,
      role: user.role
    };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: parseInt(user.id) || 0,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: parseInt(user.companyId) || 0,
        company: {
          id: parseInt(user.company.id) || 0,
          name: user.company.name,
          themePreference: 'SYSTEM',
        },
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      throw new NotFoundException('Email não encontrado');
    }

    // Gerar token de recuperação
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Salvar token no banco (criar tabela se necessário)
    await this.prisma.passwordRecoveryToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: new Date(Date.now() + 3600000), // 1 hora
      },
    });

    // Buscar dados da empresa para o email
    const userWithCompany = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { company: true },
    });

    // Enviar email de redefinição de senha
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      const passwordResetEmailContent = this.emailTemplateService.renderTemplate('password-reset', {
        userName: user.name,
        companyName: userWithCompany?.company?.name || 'Sistema',
        resetUrl: resetUrl,
      });

      await this.mailerService.sendEmail(
        user.email,
        `🔐 Redefinir senha - ${userWithCompany?.company?.name || 'Sistema'}`,
        passwordResetEmailContent,
      );
    } catch (error) {
      console.error('Erro ao enviar email de redefinição de senha:', error);
      // Não bloquear o processo se o email falhar
    }

    return {
      message: 'Email de recuperação enviado',
      // Em desenvolvimento, manter o token para facilitar testes:
      ...(process.env.NODE_ENV === 'development' && { token: resetToken }),
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // Buscar token
    const tokenRecord = await this.prisma.passwordRecoveryToken.findFirst({
      where: {
        token: resetPasswordDto.token,
        expiresAt: {
          gt: new Date(),
        },
        used: false,
      },
      include: {
        user: true,
      },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    // Atualizar senha e marcar token como usado
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { passwordHash: hashedPassword },
      }),
      this.prisma.passwordRecoveryToken.update({
        where: { id: tokenRecord.id },
        data: { used: true },
      }),
    ]);

    return { message: 'Senha alterada com sucesso' };
  }
}
