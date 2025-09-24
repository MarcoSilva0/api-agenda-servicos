import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto/update-employee.dto';
import { ServicePreferenceDto } from './dto/service-preference.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Funcionários')
@Controller('employees')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar novo funcionário',
    description: 'Cria um novo funcionário na empresa do usuário autenticado',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Funcionário criado com sucesso',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Request() req: any,
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.create(createEmployeeDto, req.user.companyId);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar funcionários',
    description: 'Lista todos os funcionários da empresa com paginação',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (padrão: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Itens por página (padrão: 10)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de funcionários retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/EmployeeResponseDto' },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Request() req: any,
  ) {
    return this.employeesService.findAll(req.user.companyId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar funcionário por ID',
    description: 'Retorna os detalhes de um funcionário específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do funcionário',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Funcionário encontrado com sucesso',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Funcionário não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Funcionário não pertence à sua empresa',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar funcionário',
    description: 'Atualiza os dados de um funcionário existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do funcionário',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Funcionário atualizado com sucesso',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Funcionário não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Funcionário não pertence à sua empresa',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Request() req: any,
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.update(id, updateEmployeeDto, req.user.companyId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Excluir funcionário',
    description: 'Remove um funcionário do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do funcionário',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Funcionário excluído com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Funcionário não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Funcionário não pertence à sua empresa',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.employeesService.remove(id, req.user.companyId);
  }

  @Get(':id/service-preferences')
  @ApiOperation({
    summary: 'Buscar preferências de serviço',
    description: 'Lista os serviços que um funcionário pode executar',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do funcionário',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Preferências de serviço retornadas com sucesso',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          duration: { type: 'number' },
          price: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Funcionário não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Funcionário não pertence à sua empresa',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async getServicePreferences(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.employeesService.getServicePreferences(id, req.user.companyId);
  }

  @Post(':id/service-preferences')
  @ApiOperation({
    summary: 'Definir preferências de serviço',
    description: 'Define quais serviços um funcionário pode executar',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do funcionário',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Preferências de serviço atualizadas com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        servicePreferences: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              description: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Funcionário não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Funcionário não pertence à sua empresa',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async setServicePreferences(
    @Param('id') id: string,
    @Body() servicePreferenceDto: ServicePreferenceDto,
    @Request() req: any,
  ) {
    return this.employeesService.setServicePreferences(
      id,
      servicePreferenceDto,
      req.user.companyId,
    );
  }
}
