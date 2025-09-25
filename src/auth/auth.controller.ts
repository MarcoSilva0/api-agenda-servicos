import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthResponseDto,
} from './dto/auth.dto';
import { MulterFile } from 'src/core/dto/multer.dto';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseInterceptors(
    FileInterceptor('logo', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(null, true);
        } else {
          cb(
            new Error(
              'Apenas arquivos de imagem são permitidos (JPG, PNG, GIF, WebP)',
            ),
            false,
          );
        }
      },
    }),
  )
  @ApiOperation({
    summary: 'Registrar novo usuário e empresa',
    description:
      'Cria uma nova conta de usuário e empresa no sistema (RF02). A logo é opcional e pode ser enviada como arquivo ou base64.',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    type: RegisterDto,
    description:
      'Dados para registro. Logo pode ser enviada como arquivo (multipart) ou base64 (JSON)',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário e empresa criados com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Dados inválidos, email já cadastrado ou arquivo de logo inválido',
  })
  async register(@Body() body: any, @UploadedFile() logoFile?: MulterFile) {
    let registerDto: RegisterDto;

    if (
      logoFile ||
      (body.activityBranchId && typeof body.activityBranchId === 'string')
    ) {
      registerDto = {
        companyName: body.companyName?.toString(),
        email: body.email?.toString(),
        phone: body.phone?.toString(),
        address: body.address?.toString(),
        activityBranchId: body.activityBranchId?.toString(),
        name: body.name?.toString(),
        password: body.password?.toString(),
        userPhone: body.userPhone?.toString(),
        role: body.role?.toString() || 'OWNER',
        logo: body.logo,
      } as RegisterDto;

      if (
        !registerDto.companyName ||
        !registerDto.email ||
        !registerDto.password ||
        !registerDto.name ||
        !registerDto.phone ||
        !registerDto.address ||
        !registerDto.activityBranchId
      ) {
        throw new BadRequestException(
          `Campos obrigatórios estão faltando. Dados recebidos: ${JSON.stringify(body)}`,
        );
      }

      if (!registerDto.password || registerDto.password.length < 6) {
        throw new BadRequestException('Senha deve ter pelo menos 6 caracteres');
      }
    } else {
      registerDto = body as RegisterDto;
    }

    return this.authService.register(registerDto, logoFile);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Fazer login no sistema',
    description: 'Autentica o usuário no sistema (RF02)',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar recuperação de senha',
    description: 'Envia email com código para recuperação de senha (RF12)',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Email de recuperação enviado',
  })
  @ApiResponse({
    status: 404,
    description: 'Email não encontrado',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resetar senha',
    description: 'Redefine a senha usando o código enviado por email (RF12)',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Senha alterada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido ou expirado',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
