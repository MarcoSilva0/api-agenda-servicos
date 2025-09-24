import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { ThemeResponseDto } from './dto/theme-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Usuários')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/theme')
  @ApiOperation({
    summary: 'Obter tema do usuário',
    description: 'Retorna a preferência de tema atual do usuário',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do usuário',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tema do usuário retornado com sucesso',
    type: ThemeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Sem permissão para acessar o tema deste usuário',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async getTheme(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ThemeResponseDto> {
    return this.usersService.getTheme(id, req.user.userId);
  }

  @Put(':id/theme')
  @ApiOperation({
    summary: 'Atualizar tema do usuário',
    description: 'Altera a preferência de tema do usuário',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do usuário',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tema atualizado com sucesso',
    type: ThemeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Sem permissão para alterar o tema deste usuário',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de tema inválidos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async updateTheme(
    @Param('id') id: string,
    @Body() updateThemeDto: UpdateThemeDto,
    @Request() req: any,
  ): Promise<ThemeResponseDto> {
    return this.usersService.updateTheme(id, updateThemeDto, req.user.userId);
  }
}
