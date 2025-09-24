import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto, AppointmentStatus } from './dto/update-appointment.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CalendarQueryDto } from './dto/calendar.dto';
import { CalendarResponseDto, CalendarDayDto } from './dto/calendar-response.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto, companyId: string): Promise<AppointmentResponseDto> {
    const { clientName, clientPhone, appointmentDateStart, appointmentDateEnd, serviceId, employeeId } = createAppointmentDto;

    // Verificar se o serviço pertence à empresa
    const service = await this.prisma.service.findFirst({
      where: { 
        id: serviceId,
        companyId,
      },
    });

    if (!service) {
      throw new NotFoundException('Serviço não encontrado ou não pertence à sua empresa');
    }

    // Verificar se o funcionário pertence à empresa (se especificado)
    if (employeeId) {
      const employee = await this.prisma.employee.findFirst({
        where: { 
          id: employeeId,
          companyId,
        },
      });

      if (!employee) {
        throw new NotFoundException('Funcionário não encontrado ou não pertence à sua empresa');
      }
    }

    // Converter strings para Date
    const dateStart = new Date(appointmentDateStart);
    const dateEnd = new Date(appointmentDateEnd);
    
    // Validar se a data de término é posterior à data de início
    if (dateEnd <= dateStart) {
      throw new BadRequestException('A data/horário de término deve ser posterior ao início');
    }
    
    // Verificar conflitos de horário
    await this.checkTimeConflict(dateStart, dateEnd, companyId, employeeId);

    // Buscar ou criar cliente
    let client = await this.prisma.client.findFirst({
      where: {
        phone: clientPhone,
        companyId,
      },
    });

    if (!client) {
      client = await this.prisma.client.create({
        data: {
          name: clientName,
          phone: clientPhone,
          companyId,
        },
      });
    } else {
      // Atualizar nome se diferente
      if (client.name !== clientName) {
        client = await this.prisma.client.update({
          where: { id: client.id },
          data: { name: clientName },
        });
      }
    }

    // Criar agendamento
    const appointment = await this.prisma.appointment.create({
      data: {
        companyId,
        clientId: client.id,
        serviceId,
        employeeId,
        appointmentDateStart: dateStart,
        appointmentDateEnd: dateEnd,
        status: AppointmentStatus.SCHEDULED,
      },
      include: {
        client: true,
        service: true,
        employee: true,
      },
    });

    return this.formatAppointmentResponse(appointment);
  }

  async findAll(companyId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where: { companyId },
        skip,
        take: limit,
        orderBy: [
          { appointmentDateStart: 'asc' },
        ],
        include: {
          client: true,
          service: true,
          employee: true,
        },
      }),
      this.prisma.appointment.count({ where: { companyId } }),
    ]);

    const appointments = data.map(appointment => this.formatAppointmentResponse(appointment));

    return {
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId: string): Promise<AppointmentResponseDto> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        service: true,
        employee: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    if (appointment.companyId !== companyId) {
      throw new ForbiddenException('Agendamento não pertence à sua empresa');
    }

    return this.formatAppointmentResponse(appointment);
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto, companyId: string): Promise<AppointmentResponseDto> {
    const appointment = await this.findOne(id, companyId);
    
    // Não permitir atualizar agendamentos já completados ou cancelados
    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException('Não é possível atualizar agendamentos finalizados ou cancelados');
    }

    const { appointmentDateStart, appointmentDateEnd, serviceId, employeeId, ...otherUpdates } = updateAppointmentDto;

    // Verificar serviço se fornecido
    if (serviceId && serviceId !== appointment.service.id) {
      const service = await this.prisma.service.findFirst({
        where: { 
          id: serviceId,
          companyId,
        },
      });

      if (!service) {
        throw new NotFoundException('Serviço não encontrado ou não pertence à sua empresa');
      }
    }

    // Verificar funcionário se fornecido
    if (employeeId && employeeId !== appointment.employee?.id) {
      const employee = await this.prisma.employee.findFirst({
        where: { 
          id: employeeId,
          companyId,
        },
      });

      if (!employee) {
        throw new NotFoundException('Funcionário não encontrado ou não pertence à sua empresa');
      }
    }

    // Verificar conflitos se data/hora foram alteradas
    if (appointmentDateStart || appointmentDateEnd) {
      const newDateStart = appointmentDateStart ? new Date(appointmentDateStart) : appointment.appointmentDateStart;
      const newDateEnd = appointmentDateEnd ? new Date(appointmentDateEnd) : appointment.appointmentDateEnd;
      
      // Validar se a data de término é posterior à data de início
      if (newDateEnd <= newDateStart) {
        throw new BadRequestException('A data/horário de término deve ser posterior ao início');
      }
      
      await this.checkTimeConflict(newDateStart, newDateEnd, companyId, employeeId || appointment.employee?.id, id);
    }

    // Preparar dados para atualização
    const updateData: any = { ...otherUpdates };
    
    if (appointmentDateStart) {
      updateData.appointmentDateStart = new Date(appointmentDateStart);
    }
    
    if (appointmentDateEnd) {
      updateData.appointmentDateEnd = new Date(appointmentDateEnd);
    }
    
    if (serviceId) {
      updateData.serviceId = serviceId;
    }
    
    if (employeeId !== undefined) {
      updateData.employeeId = employeeId;
    }

    // Atualizar agendamento
    const updatedAppointment = await this.prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        service: true,
        employee: true,
      },
    });

    return this.formatAppointmentResponse(updatedAppointment);
  }

  async remove(id: string, companyId: string) {
    const appointment = await this.findOne(id, companyId);

    await this.prisma.appointment.delete({
      where: { id },
    });

    return {
      message: 'Agendamento excluído com sucesso',
    };
  }

  async checkAvailability(checkAvailabilityDto: CheckAvailabilityDto, companyId: string, employeeId?: string) {
    const { dateStart, dateEnd } = checkAvailabilityDto;
    const startDateTime = new Date(dateStart);
    const endDateTime = new Date(dateEnd);

    // Verificar se há sobreposição de horários
    const conflictWhere: any = {
      companyId,
      status: AppointmentStatus.SCHEDULED,
      OR: [
        // Novo agendamento inicia durante um agendamento existente
        {
          AND: [
            { appointmentDateStart: { lte: startDateTime } },
            { appointmentDateEnd: { gt: startDateTime } }
          ]
        },
        // Novo agendamento termina durante um agendamento existente
        {
          AND: [
            { appointmentDateStart: { lt: endDateTime } },
            { appointmentDateEnd: { gte: endDateTime } }
          ]
        },
        // Novo agendamento engloba um agendamento existente
        {
          AND: [
            { appointmentDateStart: { gte: startDateTime } },
            { appointmentDateEnd: { lte: endDateTime } }
          ]
        }
      ]
    };

    if (employeeId) {
      conflictWhere.employeeId = employeeId;
    }

    const existingAppointment = await this.prisma.appointment.findFirst({
      where: conflictWhere,
    });

    return {
      available: !existingAppointment,
      message: existingAppointment ? 'Horário possui conflito com outro agendamento' : 'Horário disponível',
    };
  }

  async getServicesSortedByFavorites(companyId: string) {
    return this.prisma.service.findMany({
      where: { companyId },
      orderBy: [
        { isFavorite: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  async getEmployeesByServicePreference(serviceId: string, companyId: string) {
    // Buscar funcionários que têm preferência pelo serviço
    const employeesWithPreference = await this.prisma.employee.findMany({
      where: {
        companyId,
        servicePreferences: {
          some: {
            serviceId,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Buscar demais funcionários
    const otherEmployees = await this.prisma.employee.findMany({
      where: {
        companyId,
        servicePreferences: {
          none: {
            serviceId,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return [...employeesWithPreference, ...otherEmployees];
  }

  private async checkTimeConflict(dateStart: Date, dateEnd: Date, companyId: string, employeeId?: string, excludeAppointmentId?: string) {
    // Verificar se há sobreposição de horários
    const conflictWhere: any = {
      companyId,
      status: AppointmentStatus.SCHEDULED,
      OR: [
        // Novo agendamento inicia durante um agendamento existente
        {
          AND: [
            { appointmentDateStart: { lte: dateStart } },
            { appointmentDateEnd: { gt: dateStart } }
          ]
        },
        // Novo agendamento termina durante um agendamento existente
        {
          AND: [
            { appointmentDateStart: { lt: dateEnd } },
            { appointmentDateEnd: { gte: dateEnd } }
          ]
        },
        // Novo agendamento engloba um agendamento existente
        {
          AND: [
            { appointmentDateStart: { gte: dateStart } },
            { appointmentDateEnd: { lte: dateEnd } }
          ]
        }
      ]
    };

    if (employeeId) {
      conflictWhere.employeeId = employeeId;
    }

    if (excludeAppointmentId) {
      conflictWhere.id = { not: excludeAppointmentId };
    }

    const existingAppointment = await this.prisma.appointment.findFirst({
      where: conflictWhere,
      include: {
        client: true,
        service: true,
        employee: true,
      },
    });

    if (existingAppointment) {
      const conflictMessage = employeeId 
        ? `Funcionário ${existingAppointment.employee?.name} já tem agendamento que conflita com este horário`
        : `Já existe agendamento que conflita com este horário`;
      
      throw new BadRequestException(conflictMessage);
    }
  }

  private formatAppointmentResponse(appointment: any): AppointmentResponseDto {
    return {
      id: appointment.id,
      companyId: appointment.companyId,
      client: {
        id: appointment.client.id,
        name: appointment.client.name,
        phone: appointment.client.phone,
      },
      service: {
        id: appointment.service.id,
        name: appointment.service.name,
        description: appointment.service.description,
        isFavorite: appointment.service.isFavorite,
      },
      employee: appointment.employee ? {
        id: appointment.employee.id,
        name: appointment.employee.name,
        photoUrl: appointment.employee.photoUrl,
      } : undefined,
      appointmentDateStart: appointment.appointmentDateStart,
      appointmentDateEnd: appointment.appointmentDateEnd,
      status: appointment.status,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  }

  // Métodos para Calendário (RF07)
  async getCalendar(companyId: string, calendarQuery: CalendarQueryDto): Promise<CalendarResponseDto> {
    const { startDate, endDate } = calendarQuery;
    
    // Se não informado, usar período padrão de 30 dias a partir de hoje
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1); // Primeiro dia do mês
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // Último dia do mês
    
    const periodStart = startDate ? new Date(startDate) : defaultStart;
    const periodEnd = endDate ? new Date(endDate) : defaultEnd;

    const appointments = await this.prisma.appointment.findMany({
      where: {
        companyId,
        appointmentDateStart: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      orderBy: [
        { appointmentDateStart: 'asc' },
      ],
      include: {
        client: true,
        service: true,
        employee: true,
      },
    });

    // Agrupar por data
    const dayGroups = new Map<string, any[]>();
    
    appointments.forEach(appointment => {
      const date = appointment.appointmentDateStart.toISOString().split('T')[0];
      if (!dayGroups.has(date)) {
        dayGroups.set(date, []);
      }
      dayGroups.get(date)!.push(appointment);
    });

    // Criar resposta do calendário
    const days: CalendarDayDto[] = Array.from(dayGroups.entries()).map(([date, dayAppointments]) => {
      const now = new Date();
      const overdueCount = dayAppointments.filter(appointment => 
        appointment.appointmentDateStart < now && appointment.status === 'scheduled'
      ).length;

      return {
        date,
        totalAppointments: dayAppointments.length,
        appointments: dayAppointments.map(appointment => this.formatAppointmentResponse(appointment)),
        overdueCount,
      };
    });

    return {
      days: days.sort((a, b) => a.date.localeCompare(b.date)),
      totalAppointments: appointments.length,
      totalDays: days.length,
    };
  }

  async getAppointmentsByDate(companyId: string, date: string): Promise<AppointmentResponseDto[]> {
    // Criar início e fim do dia
    const startDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(`${date}T23:59:59.999Z`);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        companyId,
        appointmentDateStart: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: [
        { appointmentDateStart: 'asc' },
      ],
      include: {
        client: true,
        service: true,
        employee: true,
      },
    });

    return appointments.map(appointment => this.formatAppointmentResponse(appointment));
  }

  async getOverdueAppointments(companyId: string): Promise<AppointmentResponseDto[]> {
    const now = new Date();

    const appointments = await this.prisma.appointment.findMany({
      where: {
        companyId,
        appointmentDateStart: {
          lt: now,
        },
        status: 'scheduled', // Apenas agendamentos que ainda não foram atendidos
      },
      orderBy: [
        { appointmentDateStart: 'desc' }, // Mais recentes primeiro
      ],
      include: {
        client: true,
        service: true,
        employee: true,
      },
    });

    return appointments.map(appointment => this.formatAppointmentResponse(appointment));
  }
}
