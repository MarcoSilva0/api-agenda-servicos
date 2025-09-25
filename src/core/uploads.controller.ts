import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { FileUploadService } from './file-upload.service';
import * as path from 'path';
import * as mime from 'mime-types';

@ApiTags('Arquivos')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Get('companies/:companyId/:filename')
  @ApiOperation({
    summary: 'Obter arquivo da empresa',
    description: 'Serve arquivos estáticos da empresa como logos',
  })
  @ApiParam({ name: 'companyId', description: 'ID da empresa' })
  @ApiParam({ name: 'filename', description: 'Nome do arquivo' })
  @ApiResponse({
    status: 200,
    description: 'Arquivo encontrado e servido',
  })
  @ApiResponse({
    status: 404,
    description: 'Arquivo não encontrado',
  })
  async getCompanyFile(
    @Param('companyId') companyId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const relativePath = `/companies/${companyId}/${filename}`;
    const fileExists = await this.fileUploadService.fileExists(relativePath);

    if (!fileExists) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    const physicalPath = this.fileUploadService.getPhysicalPath(relativePath);
    const mimeType = mime.lookup(physicalPath) || 'application/octet-stream';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    res.sendFile(physicalPath);
  }
}