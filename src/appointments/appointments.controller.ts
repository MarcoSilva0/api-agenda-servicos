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
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CalendarQueryDto } from './dto/calendar.dto';
import { CalendarResponseDto } from './dto/calendar-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Agendamentos')
@Controller('appointments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar novo agendamento',
    description: 'Cria um agendamento com validação de conflitos e criação automática de cliente',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Agendamento criado com sucesso',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos ou conflito de horário',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Serviço ou funcionário não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Request() req: any,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.create(createAppointmentDto, req.user.companyId);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar agendamentos',
    description: 'Lista agendamentos da empresa ordenados por data e hora',
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
    description: 'Lista de agendamentos retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/AppointmentResponseDto' },
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
    return this.appointmentsService.findAll(req.user.companyId, paginationDto);
  }

  @Get('services/by-favorites')
  @ApiOperation({
    summary: 'Listar serviços ordenados por favoritos',
    description: 'Retorna serviços da empresa com favoritos primeiro (para facilitar seleção)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de serviços ordenada com sucesso',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          isFavorite: { type: 'boolean' },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async getServicesSortedByFavorites(@Request() req: any) {
    return this.appointmentsService.getServicesSortedByFavorites(req.user.companyId);
  }

  @Get('employees/by-service/:serviceId')
  @ApiOperation({
    summary: 'Listar funcionários ordenados por preferência de serviço',
    description: 'Retorna funcionários com aqueles que têm preferência pelo serviço primeiro',
  })
  @ApiParam({
    name: 'serviceId',
    description: 'ID do serviço para ordenar funcionários por preferência',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de funcionários ordenada com sucesso',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          photoUrl: { type: 'string', nullable: true },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async getEmployeesByServicePreference(
    @Param('serviceId') serviceId: string,
    @Request() req: any,
  ) {
    return this.appointmentsService.getEmployeesByServicePreference(serviceId, req.user.companyId);
  }

  @Get('check-availability')
  @ApiOperation({
    summary: 'Verificar disponibilidade de horário',
    description: 'Verifica se um período específico está disponível para agendamento',
  })
  @ApiQuery({
    name: 'dateStart',
    required: true,
    type: String,
    description: 'Data e hora de início no formato ISO 8601',
    example: '2025-09-25T14:30:00.000Z',
  })
  @ApiQuery({
    name: 'dateEnd',
    required: true,
    type: String,
    description: 'Data e hora de fim no formato ISO 8601',
    example: '2025-09-25T15:30:00.000Z',
  })
  @ApiQuery({
    name: 'employeeId',
    required: false,
    type: String,
    description: 'ID do funcionário (opcional, para verificar disponibilidade específica)',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status de disponibilidade retornado',
    schema: {
      type: 'object',
      properties: {
        available: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parâmetros de data/hora inválidos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async checkAvailability(
    @Query() checkAvailabilityDto: CheckAvailabilityDto,
    @Query('employeeId') employeeId: string,
    @Request() req: any,
  ) {
    return this.appointmentsService.checkAvailability(
      checkAvailabilityDto,
      req.user.companyId,
      employeeId,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar agendamento por ID',
    description: 'Retorna os detalhes de um agendamento específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do agendamento',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Agendamento encontrado com sucesso',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Agendamento não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Agendamento não pertence à sua empresa',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar agendamento',
    description: 'Atualiza dados de um agendamento (apenas agendamentos com status "scheduled")',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do agendamento',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Agendamento atualizado com sucesso',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Agendamento não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Agendamento não pertence à sua empresa',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Agendamento não pode ser atualizado ou dados inválidos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Request() req: any,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.update(id, updateAppointmentDto, req.user.companyId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Excluir agendamento',
    description: 'Remove um agendamento do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do agendamento',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Agendamento excluído com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Agendamento não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Agendamento não pertence à sua empresa',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.appointmentsService.remove(id, req.user.companyId);
  }

  // Endpoints para Calendário (RF07)
  @Get('calendar')
  @ApiOperation({
    summary: 'Visualizar calendário de agendamentos',
    description: 'Retorna agendamentos agrupados por data para visualização em calendário',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Data inicial (formato ISO 8601). Se não informada, usa primeiro dia do mês atual',
    example: '2025-09-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Data final (formato ISO 8601). Se não informada, usa último dia do mês atual',
    example: '2025-09-30T23:59:59.999Z',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Calendário de agendamentos retornado com sucesso',
    type: CalendarResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parâmetros de data inválidos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async getCalendar(
    @Query() calendarQuery: CalendarQueryDto,
    @Request() req: any,
  ): Promise<CalendarResponseDto> {
    return this.appointmentsService.getCalendar(req.user.companyId, calendarQuery);
  }

  @Get('date/:date')
  @ApiOperation({
    summary: 'Buscar agendamentos por data específica',
    description: 'Retorna todos os agendamentos de uma data específica ordenados por horário',
  })
  @ApiParam({
    name: 'date',
    description: 'Data no formato YYYY-MM-DD',
    type: 'string',
    example: '2025-09-25',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Agendamentos da data retornados com sucesso',
    type: [AppointmentResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Formato de data inválido',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async getAppointmentsByDate(
    @Param('date') date: string,
    @Request() req: any,
  ): Promise<AppointmentResponseDto[]> {
    // Validação básica do formato de data
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new BadRequestException('Formato de data inválido. Use YYYY-MM-DD');
    }

    return this.appointmentsService.getAppointmentsByDate(req.user.companyId, date);
  }

  @Get('overdue')
  @ApiOperation({
    summary: 'Listar agendamentos em atraso',
    description: 'Retorna agendamentos que já passaram do horário mas ainda estão com status "scheduled"',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Agendamentos em atraso retornados com sucesso',
    type: [AppointmentResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async getOverdueAppointments(@Request() req: any): Promise<AppointmentResponseDto[]> {
    return this.appointmentsService.getOverdueAppointments(req.user.companyId);
  }

  @Post('send-reminders')
  @ApiOperation({
    summary: 'Enviar lembretes de agendamento',
    description: 'Envia lembretes por email para agendamentos do dia seguinte',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lembretes enviados com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Lembretes processados',
        },
        sent: {
          type: 'number',
          example: 5,
          description: 'Quantidade de lembretes enviados com sucesso',
        },
        errors: {
          type: 'number',
          example: 0,
          description: 'Quantidade de erros ao enviar lembretes',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
  })
  async sendReminders(@Request() req: any) {
    const result = await this.appointmentsService.sendAppointmentReminders(req.user.companyId);
    return {
      message: 'Lembretes processados',
      ...result
    };
  }
}
