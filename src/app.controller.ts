import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { join } from 'path';

@ApiTags('Sistema')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Documentação do Projeto',
    description: 'Página principal com documentação completa do sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Documentação HTML renderizada',
  })
  getDocumentation(@Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'public', 'index.html'));
  }

  @Get('health')
  @ApiOperation({
    summary: 'Status da API',
    description: 'Verifica se a API está funcionando corretamente',
  })
  @ApiResponse({
    status: 200,
    description: 'API funcionando normalmente',
  })
  getHealth() {
    return this.appService.getHealth();
  }
}
