import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthResponseDto,
} from './dto/auth.dto';
import { ThemePreference } from '@prisma/client';
import { MailerService } from 'src/mailer/mailer.service';
import { EmailTemplateService } from 'src/core/email-template.service';
import { FileUploadService } from 'src/core/file-upload.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly emailTemplateService: EmailTemplateService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async register(
    registerDto: RegisterDto,
    logoFile?: any,
  ): Promise<AuthResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: registerDto.companyName,
          email: registerDto.email,
          phone: registerDto.phone,
          address: registerDto.address,
          logoUrl: null,
          activityBranchId: registerDto.activityBranchId.toString(),
        },
      });

      let logoUrl: string | null = null;

      try {
        if (logoFile && logoFile.buffer) {
          logoUrl = await this.fileUploadService.saveCompanyLogoFromBuffer(
            company.id,
            logoFile.buffer,
            logoFile.mimetype,
          );
        } else if (registerDto.logo && registerDto.logo.startsWith('data:')) {
          logoUrl = await this.fileUploadService.saveCompanyLogo(
            company.id,
            registerDto.logo,
          );
        }

        if (logoUrl) {
          await tx.company.update({
            where: { id: company.id },
            data: { logoUrl },
          });
        }
      } catch (error) {
        console.warn('Erro ao salvar logo da empresa:', error.message);
      }

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

      try {
        const defaultServices = await tx.defaultActivityService.findMany({
          where: { activityBranchId: registerDto.activityBranchId.toString() },
        });

        if (defaultServices.length > 0) {
          await tx.service.createMany({
            data: defaultServices.map((defaultService) => ({
              companyId: company.id,
              name: defaultService.name,
              description: defaultService.description,
              isFavorite: defaultService.isFavoriteDefault,
              isActive: true,
              isFromActivityBranch: true,
              isSystemDefault: true, // Serviços importados do sistema
              activityBranchId: registerDto.activityBranchId.toString(),
            })),
          });
          
          console.log(`Empresa '${company.name}' registrada com ${defaultServices.length} serviços padrão importados automaticamente`);
        } else {
          console.log(`Nenhum serviço padrão encontrado para o ramo de atividade: ${registerDto.activityBranchId}`);
        }
      } catch (error) {
        console.warn('Erro ao importar serviços padrão:', error.message);
      }

      return { user, company: { ...company, logoUrl } };
    });

    const payload = {
      sub: result.user.id,
      email: result.user.email,
      name: result.user.name,
      companyId: result.user.companyId,
      role: result.user.role,
    };
    const access_token = this.jwtService.sign(payload);

    try {
      const welcomeEmailContent = this.emailTemplateService.renderTemplate(
        'welcome',
        {
          userName: result.user.name,
          companyName: result.company.name,
          companyEmail: result.company.email,
          companyPhone: result.company.phone,
          companyAddress: result.company.address,
          loginUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        },
      );

      await this.mailerService.sendEmail(
        result.user.email,
        `🎉 Bem-vindo à ${result.company.name}!`,
        welcomeEmailContent,
      );
    } catch (error) {
      console.error('Erro ao enviar email de boas-vindas:', error);
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
          logoUrl: result.company.logoUrl,
          themePreference: 'SYSTEM',
        },
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        company: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      companyId: user.companyId,
      role: user.role,
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
          logoUrl: user.company.logoUrl,
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

    const resetToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    await this.prisma.passwordRecoveryToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: new Date(Date.now() + 3600000),
      },
    });

    const userWithCompany = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { company: true },
    });

    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

      const passwordResetEmailContent =
        this.emailTemplateService.renderTemplate('password-reset', {
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
    }

    return {
      message: 'Email de recuperação enviado',

      ...(process.env.NODE_ENV === 'development' && { token: resetToken }),
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
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

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

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
