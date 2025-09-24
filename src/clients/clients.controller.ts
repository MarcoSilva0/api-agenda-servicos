import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { 
  CreateClientDto, 
  UpdateClientDto, 
  ClientReportQueryDto, 
  ClientResponseDto,
  ClientReportResponseDto 
} from './dto/client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Clientes')
@Controller('clients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar novo cliente',
    description: 'Cria um novo cliente para a empresa do usuário autenticado',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cliente criado com sucesso',
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos fornecidos',
  })
  async create(@Body() createClientDto: CreateClientDto, @Request() req) {
    return this.clientsService.create(createClientDto, req.user.companyId);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os clientes',
    description: 'Lista todos os clientes da empresa com paginação',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Itens por página',
    example: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de clientes retornada com sucesso',
    type: ClientReportResponseDto,
  })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Request() req?
  ) {
    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '10');
    return this.clientsService.findAll(req.user.companyId, pageNum, limitNum);
  }

  @Get('report')
  @ApiOperation({
    summary: 'Relatório de clientes com filtros',
    description: 'Gera relatório de clientes com filtros por nome, período, mês ou ano (RF11)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Relatório de clientes gerado com sucesso',
    type: ClientReportResponseDto,
  })
  async getReport(@Query() query: ClientReportQueryDto, @Request() req) {
    return this.clientsService.getReport(query, req.user.companyId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar cliente específico',
    description: 'Retorna os dados de um cliente específico da empresa',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do cliente',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cliente encontrado com sucesso',
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cliente não encontrado',
  })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.clientsService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar cliente',
    description: 'Atualiza os dados de um cliente existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do cliente',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cliente atualizado com sucesso',
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cliente não encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @Request() req
  ) {
    return this.clientsService.update(id, updateClientDto, req.user.companyId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Excluir cliente',
    description: 'Remove um cliente da empresa',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do cliente',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Cliente excluído com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cliente não encontrado',
  })
  async remove(@Param('id') id: string, @Request() req) {
    return this.clientsService.remove(id, req.user.companyId);
  }
}
