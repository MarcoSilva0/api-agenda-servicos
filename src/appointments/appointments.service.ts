import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import {
  UpdateAppointmentDto,
  AppointmentStatus,
} from './dto/update-appointment.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CalendarQueryDto } from './dto/calendar.dto';
import {
  CalendarResponseDto,
  CalendarDayDto,
} from './dto/calendar-response.dto';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
    companyId: string,
  ): Promise<AppointmentResponseDto> {
    const {
      clientName,
      clientPhone,
      appointmentDateStart,
      appointmentDateEnd,
      serviceId,
      employeeId,
    } = createAppointmentDto;

    const service = await this.prisma.service.findFirst({
      where: {
        id: serviceId,
        companyId,
      },
    });

    if (!service) {
      throw new NotFoundException(
        'Serviço não encontrado ou não pertence à sua empresa',
      );
    }

    if (employeeId) {
      const employee = await this.prisma.employee.findFirst({
        where: {
          id: employeeId,
          companyId,
        },
      });

      if (!employee) {
        throw new NotFoundException(
          'Funcionário não encontrado ou não pertence à sua empresa',
        );
      }
    }

    const dateStart = new Date(appointmentDateStart);
    const dateEnd = new Date(appointmentDateEnd);

    if (dateEnd <= dateStart) {
      throw new BadRequestException(
        'A data/horário de término deve ser posterior ao início',
      );
    }

    await this.checkTimeConflict(dateStart, dateEnd, companyId, employeeId);

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
      if (client.name !== clientName) {
        client = await this.prisma.client.update({
          where: { id: client.id },
          data: { name: clientName },
        });
      }
    }

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
        company: true,
      },
    });

    try {
      const clientEmail = `${client.phone}@example.com`;

      await this.notificationService.sendAppointmentConfirmation({
        clientName: appointment.client.name,
        clientEmail: clientEmail,
        companyName: appointment.company.name,
        companyEmail: appointment.company.email || '',
        companyPhone: appointment.company.phone || '',
        companyAddress: appointment.company.address || '',
        appointmentDate:
          appointment.appointmentDateStart.toLocaleDateString('pt-BR'),
        appointmentTime: appointment.appointmentDateStart.toLocaleTimeString(
          'pt-BR',
          {
            hour: '2-digit',
            minute: '2-digit',
          },
        ),
        serviceName: appointment.service.name,
        servicePrice: 'A definir',
        employeeName: appointment.employee?.name || 'Não especificado',
      });
    } catch (error) {
      console.error('Erro ao enviar email de confirmação:', error);
    }

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
        orderBy: [{ appointmentDateStart: 'asc' }],
        include: {
          client: true,
          service: true,
          employee: true,
        },
      }),
      this.prisma.appointment.count({ where: { companyId } }),
    ]);

    const appointments = data.map((appointment) =>
      this.formatAppointmentResponse(appointment),
    );

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

  async findOne(
    id: string,
    companyId: string,
  ): Promise<AppointmentResponseDto> {
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

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    companyId: string,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.findOne(id, companyId);

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException(
        'Não é possível atualizar agendamentos finalizados ou cancelados',
      );
    }

    const {
      appointmentDateStart,
      appointmentDateEnd,
      serviceId,
      employeeId,
      ...otherUpdates
    } = updateAppointmentDto;

    if (serviceId && serviceId !== appointment.service.id) {
      const service = await this.prisma.service.findFirst({
        where: {
          id: serviceId,
          companyId,
        },
      });

      if (!service) {
        throw new NotFoundException(
          'Serviço não encontrado ou não pertence à sua empresa',
        );
      }
    }

    if (employeeId && employeeId !== appointment.employee?.id) {
      const employee = await this.prisma.employee.findFirst({
        where: {
          id: employeeId,
          companyId,
        },
      });

      if (!employee) {
        throw new NotFoundException(
          'Funcionário não encontrado ou não pertence à sua empresa',
        );
      }
    }

    if (appointmentDateStart || appointmentDateEnd) {
      const newDateStart = appointmentDateStart
        ? new Date(appointmentDateStart)
        : appointment.appointmentDateStart;
      const newDateEnd = appointmentDateEnd
        ? new Date(appointmentDateEnd)
        : appointment.appointmentDateEnd;

      if (newDateEnd <= newDateStart) {
        throw new BadRequestException(
          'A data/horário de término deve ser posterior ao início',
        );
      }

      await this.checkTimeConflict(
        newDateStart,
        newDateEnd,
        companyId,
        employeeId || appointment.employee?.id,
        id,
      );
    }

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

  async checkAvailability(
    checkAvailabilityDto: CheckAvailabilityDto,
    companyId: string,
    employeeId?: string,
  ) {
    const { dateStart, dateEnd } = checkAvailabilityDto;
    const startDateTime = new Date(dateStart);
    const endDateTime = new Date(dateEnd);

    const conflictWhere: any = {
      companyId,
      status: AppointmentStatus.SCHEDULED,
      OR: [
        {
          AND: [
            { appointmentDateStart: { lte: startDateTime } },
            { appointmentDateEnd: { gt: startDateTime } },
          ],
        },

        {
          AND: [
            { appointmentDateStart: { lt: endDateTime } },
            { appointmentDateEnd: { gte: endDateTime } },
          ],
        },

        {
          AND: [
            { appointmentDateStart: { gte: startDateTime } },
            { appointmentDateEnd: { lte: endDateTime } },
          ],
        },
      ],
    };

    if (employeeId) {
      conflictWhere.employeeId = employeeId;
    }

    const existingAppointment = await this.prisma.appointment.findFirst({
      where: conflictWhere,
    });

    return {
      available: !existingAppointment,
      message: existingAppointment
        ? 'Horário possui conflito com outro agendamento'
        : 'Horário disponível',
    };
  }

  async getServicesSortedByFavorites(companyId: string) {
    return this.prisma.service.findMany({
      where: { companyId },
      orderBy: [{ isFavorite: 'desc' }, { name: 'asc' }],
    });
  }

  async getEmployeesByServicePreference(serviceId: string, companyId: string) {
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

  private async checkTimeConflict(
    dateStart: Date,
    dateEnd: Date,
    companyId: string,
    employeeId?: string,
    excludeAppointmentId?: string,
  ) {
    const conflictWhere: any = {
      companyId,
      status: AppointmentStatus.SCHEDULED,
      OR: [
        {
          AND: [
            { appointmentDateStart: { lte: dateStart } },
            { appointmentDateEnd: { gt: dateStart } },
          ],
        },

        {
          AND: [
            { appointmentDateStart: { lt: dateEnd } },
            { appointmentDateEnd: { gte: dateEnd } },
          ],
        },

        {
          AND: [
            { appointmentDateStart: { gte: dateStart } },
            { appointmentDateEnd: { lte: dateEnd } },
          ],
        },
      ],
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
        description: appointment.service.description || undefined,
        isFavorite: appointment.service.isFavorite,
      },
      employee: appointment.employee
        ? {
            id: appointment.employee.id,
            name: appointment.employee.name,
            photoUrl: appointment.employee.photoUrl,
          }
        : undefined,
      appointmentDateStart: appointment.appointmentDateStart,
      appointmentDateEnd: appointment.appointmentDateEnd,
      status: appointment.status,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  }

  async getCalendar(
    companyId: string,
    calendarQuery: CalendarQueryDto,
  ): Promise<CalendarResponseDto> {
    const { startDate, endDate } = calendarQuery;

    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

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
      orderBy: [{ appointmentDateStart: 'asc' }],
      include: {
        client: true,
        service: true,
        employee: true,
      },
    });

    const dayGroups = new Map<string, any[]>();

    appointments.forEach((appointment) => {
      const date = appointment.appointmentDateStart.toISOString().split('T')[0];
      if (!dayGroups.has(date)) {
        dayGroups.set(date, []);
      }
      dayGroups.get(date)!.push(appointment);
    });

    const days: CalendarDayDto[] = Array.from(dayGroups.entries()).map(
      ([date, dayAppointments]) => {
        const now = new Date();
        const overdueCount = dayAppointments.filter(
          (appointment) =>
            appointment.appointmentDateStart < now &&
            appointment.status === 'scheduled',
        ).length;

        return {
          date,
          totalAppointments: dayAppointments.length,
          appointments: dayAppointments.map((appointment) =>
            this.formatAppointmentResponse(appointment),
          ),
          overdueCount,
        };
      },
    );

    return {
      days: days.sort((a, b) => a.date.localeCompare(b.date)),
      totalAppointments: appointments.length,
      totalDays: days.length,
    };
  }

  async getAppointmentsByDate(
    companyId: string,
    date: string,
  ): Promise<AppointmentResponseDto[]> {
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
      orderBy: [{ appointmentDateStart: 'asc' }],
      include: {
        client: true,
        service: true,
        employee: true,
      },
    });

    return appointments.map((appointment) =>
      this.formatAppointmentResponse(appointment),
    );
  }

  async getOverdueAppointments(
    companyId: string,
  ): Promise<AppointmentResponseDto[]> {
    const now = new Date();

    const appointments = await this.prisma.appointment.findMany({
      where: {
        companyId,
        appointmentDateStart: {
          lt: now,
        },
        status: 'scheduled',
      },
      orderBy: [{ appointmentDateStart: 'desc' }],
      include: {
        client: true,
        service: true,
        employee: true,
      },
    });

    return appointments.map((appointment) =>
      this.formatAppointmentResponse(appointment),
    );
  }

  /**
   * Enviar lembretes para agendamentos do dia seguinte
   */
  async sendAppointmentReminders(
    companyId: string,
  ): Promise<{ sent: number; errors: number }> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        companyId,
        status: AppointmentStatus.SCHEDULED,
        appointmentDateStart: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
      },
      include: {
        client: true,
        service: true,
        employee: true,
        company: true,
      },
    });

    let sent = 0;
    let errors = 0;

    for (const appointment of appointments) {
      try {
        const clientEmail = `${appointment.client.phone}@example.com`;

        await this.notificationService.sendAppointmentReminder({
          clientName: appointment.client.name,
          clientEmail: clientEmail,
          companyName: appointment.company.name,
          companyEmail: appointment.company.email || '',
          companyPhone: appointment.company.phone || '',
          companyAddress: appointment.company.address || '',
          appointmentDate:
            appointment.appointmentDateStart.toLocaleDateString('pt-BR'),
          appointmentTime: appointment.appointmentDateStart.toLocaleTimeString(
            'pt-BR',
            {
              hour: '2-digit',
              minute: '2-digit',
            },
          ),
          serviceName: appointment.service.name,
          servicePrice: 'A definir',
          serviceDuration: '1 hora',
          employeeName: appointment.employee?.name || 'Não especificado',
          confirmUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/confirm-appointment/${appointment.id}`,
          rescheduleUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reschedule-appointment/${appointment.id}`,
        });

        sent++;
      } catch (error) {
        console.error(
          `Erro ao enviar lembrete para agendamento ${appointment.id}:`,
          error,
        );
        errors++;
      }
    }

    return { sent, errors };
  }
}
