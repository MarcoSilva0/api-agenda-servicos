import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { UpdateShareTemplateDto } from './dto/update-share-template.dto';
import { ShareTemplateResponseDto } from './dto/share-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Empresa')
@Controller('companies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('share-template')
  @ApiOperation({
    summary: 'Obter template de compartilhamento',
    description: 'Retorna o template atual para compartilhamento de atendimentos',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Template de compartilhamento retornado com sucesso',
    type: ShareTemplateResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Empresa não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async getShareTemplate(@Request() req: any): Promise<ShareTemplateResponseDto> {
    return this.companiesService.getShareTemplate(req.user.companyId);
  }

  @Put('share-template')
  @ApiOperation({
    summary: 'Atualizar template de compartilhamento',
    description: 'Define um template personalizado para compartilhamento de atendimentos',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Template atualizado com sucesso',
    type: ShareTemplateResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Empresa não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados do template inválidos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async updateShareTemplate(
    @Body() updateDto: UpdateShareTemplateDto,
    @Request() req: any,
  ): Promise<ShareTemplateResponseDto> {
    return this.companiesService.updateShareTemplate(req.user.companyId, updateDto);
  }
}
