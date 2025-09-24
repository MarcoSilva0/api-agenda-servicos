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
} from '@nestjs/swagger';
import { AttendancesService } from './attendances.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto, AddAttendanceServiceDto } from './dto/update-attendance.dto';
import { AttendanceResponseDto, AttendanceServiceResponseDto } from './dto/attendance-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompaniesService } from '../companies/companies.service';
import { AttendanceShareResponseDto } from '../companies/dto/share-response.dto';

@ApiTags('Atendimentos')
@Controller('attendances')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AttendancesController {
  constructor(
    private readonly attendancesService: AttendancesService,
    private readonly companiesService: CompaniesService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Criar atendimento a partir de agendamento',
    description: 'Converte um agendamento em atendimento com serviços e funcionários',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Atendimento criado com sucesso',
    type: AttendanceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos ou agendamento já possui atendimento',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Agendamento não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async create(
    @Body() createAttendanceDto: CreateAttendanceDto,
    @Request() req: any,
  ): Promise<AttendanceResponseDto> {
    return this.attendancesService.create(createAttendanceDto, req.user.companyId);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar atendimentos',
    description: 'Lista atendimentos da empresa ordenados por data',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de atendimentos retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/AttendanceResponseDto' },
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
    return this.attendancesService.findAll(req.user.companyId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar atendimento por ID',
    description: 'Retorna os detalhes de um atendimento específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do atendimento',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Atendimento encontrado com sucesso',
    type: AttendanceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Atendimento não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Atendimento não pertence à sua empresa',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<AttendanceResponseDto> {
    return this.attendancesService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar atendimento',
    description: 'Atualiza serviços e funcionários de um atendimento em andamento',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do atendimento',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Atendimento atualizado com sucesso',
    type: AttendanceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Atendimento não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Atendimento já finalizado ou dados inválidos',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Atendimento não pertence à sua empresa',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
    @Request() req: any,
  ): Promise<AttendanceResponseDto> {
    return this.attendancesService.update(id, updateAttendanceDto, req.user.companyId);
  }

  @Post(':id/complete')
  @ApiOperation({
    summary: 'Finalizar atendimento',
    description: 'Marca o atendimento como finalizado e atualiza o status do agendamento',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do atendimento',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Atendimento finalizado com sucesso',
    type: AttendanceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Atendimento não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Atendimento já foi finalizado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Atendimento não pertence à sua empresa',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async complete(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<AttendanceResponseDto> {
    return this.attendancesService.complete(id, req.user.companyId);
  }

  @Get(':id/services')
  @ApiOperation({
    summary: 'Listar serviços do atendimento',
    description: 'Retorna todos os serviços incluídos no atendimento',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do atendimento',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de serviços retornada com sucesso',
    type: [AttendanceServiceResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Atendimento não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Atendimento não pertence à sua empresa',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async getServices(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<AttendanceServiceResponseDto[]> {
    return this.attendancesService.getAttendanceServices(id, req.user.companyId);
  }

  @Post(':id/services')
  @ApiOperation({
    summary: 'Adicionar serviço ao atendimento',
    description: 'Adiciona um novo serviço ao atendimento em andamento',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do atendimento',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Serviço adicionado com sucesso',
    type: AttendanceServiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Atendimento ou serviço não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Atendimento finalizado ou serviço já incluído',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Atendimento não pertence à sua empresa',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async addService(
    @Param('id') id: string,
    @Body() addServiceDto: AddAttendanceServiceDto,
    @Request() req: any,
  ): Promise<AttendanceServiceResponseDto> {
    return this.attendancesService.addService(id, addServiceDto, req.user.companyId);
  }

  @Delete(':id/services/:serviceId')
  @ApiOperation({
    summary: 'Remover serviço do atendimento',
    description: 'Remove um serviço do atendimento (deve manter pelo menos um serviço)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do atendimento',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'serviceId',
    description: 'ID único do serviço a ser removido',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Serviço removido com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Atendimento ou serviço não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Não é possível remover o último serviço ou atendimento finalizado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Atendimento não pertence à sua empresa',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async removeService(
    @Param('id') id: string,
    @Param('serviceId') serviceId: string,
    @Request() req: any,
  ) {
    return this.attendancesService.removeService(id, serviceId, req.user.companyId);
  }

  @Post(':id/share')
  @ApiOperation({
    summary: 'Gerar texto para compartilhamento',
    description: 'Gera texto formatado do atendimento para compartilhamento (apenas atendimentos finalizados)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do atendimento',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Texto de compartilhamento gerado com sucesso',
    type: AttendanceShareResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Atendimento não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Apenas atendimentos finalizados podem ser compartilhados ou atendimento não pertence à sua empresa',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async shareAttendance(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<AttendanceShareResponseDto> {
    return this.companiesService.generateAttendanceShareText(id, req.user.companyId);
  }
}
