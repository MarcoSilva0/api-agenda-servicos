import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto, AddAttendanceServiceDto } from './dto/update-attendance.dto';
import { AttendanceResponseDto, AttendanceServiceResponseDto } from './dto/attendance-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class AttendancesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAttendanceDto: CreateAttendanceDto, companyId: string): Promise<AttendanceResponseDto> {
    const { appointmentId, serviceIds, serviceEmployees } = createAttendanceDto;

    // Verificar se o agendamento existe e pertence à empresa
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        companyId,
      },
      include: {
        client: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado ou não pertence à sua empresa');
    }

    // Verificar se já existe atendimento para este agendamento
    const existingAttendance = await this.prisma.attendance.findUnique({
      where: { appointmentId },
    });

    if (existingAttendance) {
      throw new BadRequestException('Já existe um atendimento para este agendamento');
    }

    // Verificar se os serviços pertencem à empresa
    const services = await this.prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        companyId,
      },
    });

    if (services.length !== serviceIds.length) {
      throw new BadRequestException('Um ou mais serviços não pertencem à sua empresa');
    }

    // Verificar funcionários se especificados
    if (serviceEmployees && serviceEmployees.length > 0) {
      const employeeIds = serviceEmployees.map(se => se.employeeId);
      const employees = await this.prisma.employee.findMany({
        where: {
          id: { in: employeeIds },
          companyId,
        },
      });

      if (employees.length !== employeeIds.length) {
        throw new BadRequestException('Um ou mais funcionários não pertencem à sua empresa');
      }
    }

    // Criar o atendimento
    const attendance = await this.prisma.attendance.create({
      data: {
        appointmentId,
        companyId,
        clientId: appointment.clientId,
        attendanceDate: appointment.appointmentDateStart,
        attendanceTime: appointment.appointmentDateStart,
        services: {
          create: serviceIds.map(serviceId => ({
            serviceId,
          })),
        },
        employees: serviceEmployees ? {
          create: serviceEmployees.map(se => ({
            employeeId: se.employeeId,
            serviceId: se.serviceId,
          })),
        } : undefined,
      },
      include: {
        appointment: true,
        client: true,
        services: {
          include: {
            service: true,
          },
        },
        employees: {
          include: {
            employee: true,
            service: true,
          },
        },
      },
    });

    return this.formatAttendanceResponse(attendance);
  }

  async findAll(companyId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where: { companyId },
        skip,
        take: limit,
        orderBy: [
          { attendanceDate: 'desc' },
        ],
        include: {
          appointment: true,
          client: true,
          services: {
            include: {
              service: true,
            },
          },
          employees: {
            include: {
              employee: true,
              service: true,
            },
          },
        },
      }),
      this.prisma.attendance.count({ where: { companyId } }),
    ]);

    const attendances = data.map(attendance => this.formatAttendanceResponse(attendance));

    return {
      data: attendances,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId: string): Promise<AttendanceResponseDto> {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: {
        appointment: true,
        client: true,
        services: {
          include: {
            service: true,
          },
        },
        employees: {
          include: {
            employee: true,
            service: true,
          },
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException('Atendimento não encontrado');
    }

    if (attendance.companyId !== companyId) {
      throw new ForbiddenException('Atendimento não pertence à sua empresa');
    }

    return this.formatAttendanceResponse(attendance);
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto, companyId: string): Promise<AttendanceResponseDto> {
    const { serviceIds, serviceEmployees } = updateAttendanceDto;

    const attendance = await this.findOne(id, companyId);

    if (attendance.completedAt) {
      throw new BadRequestException('Não é possível atualizar um atendimento já finalizado');
    }

    // Se serviceIds foi fornecido, atualizar serviços
    if (serviceIds && serviceIds.length > 0) {
      // Verificar se os serviços pertencem à empresa
      const services = await this.prisma.service.findMany({
        where: {
          id: { in: serviceIds },
          companyId,
        },
      });

      if (services.length !== serviceIds.length) {
        throw new BadRequestException('Um ou mais serviços não pertencem à sua empresa');
      }

      // Remover serviços antigos e adicionar novos
      await this.prisma.attendanceService.deleteMany({
        where: { attendanceId: id },
      });

      await this.prisma.attendanceService.createMany({
        data: serviceIds.map(serviceId => ({
          attendanceId: id,
          serviceId,
        })),
      });
    }

    // Se serviceEmployees foi fornecido, atualizar funcionários
    if (serviceEmployees && serviceEmployees.length > 0) {
      const employeeIds = serviceEmployees.map(se => se.employeeId);
      const employees = await this.prisma.employee.findMany({
        where: {
          id: { in: employeeIds },
          companyId,
        },
      });

      if (employees.length !== employeeIds.length) {
        throw new BadRequestException('Um ou mais funcionários não pertencem à sua empresa');
      }

      // Remover funcionários antigos e adicionar novos
      await this.prisma.attendanceEmployee.deleteMany({
        where: { attendanceId: id },
      });

      await this.prisma.attendanceEmployee.createMany({
        data: serviceEmployees.map(se => ({
          attendanceId: id,
          employeeId: se.employeeId,
          serviceId: se.serviceId,
        })),
      });
    }

    // Buscar o atendimento atualizado
    return this.findOne(id, companyId);
  }

  async complete(id: string, companyId: string): Promise<AttendanceResponseDto> {
    const attendance = await this.findOne(id, companyId);

    if (attendance.completedAt) {
      throw new BadRequestException('Atendimento já foi finalizado');
    }

    const updatedAttendance = await this.prisma.attendance.update({
      where: { id },
      data: {
        completedAt: new Date(),
      },
      include: {
        appointment: true,
        client: true,
        services: {
          include: {
            service: true,
          },
        },
        employees: {
          include: {
            employee: true,
            service: true,
          },
        },
      },
    });

    // Atualizar status do agendamento para 'completed'
    await this.prisma.appointment.update({
      where: { id: attendance.appointment.id },
      data: { status: 'completed' },
    });

    return this.formatAttendanceResponse(updatedAttendance);
  }

  async getAttendanceServices(id: string, companyId: string): Promise<AttendanceServiceResponseDto[]> {
    const attendance = await this.findOne(id, companyId);

    const attendanceServices = await this.prisma.attendanceService.findMany({
      where: { attendanceId: id },
      include: {
        service: true,
      },
    });

    const attendanceEmployees = await this.prisma.attendanceEmployee.findMany({
      where: { attendanceId: id },
      include: {
        employee: true,
      },
    });

    return attendanceServices.map(as => {
      const employee = attendanceEmployees.find(ae => ae.serviceId === as.serviceId);
      
      return {
        id: as.id,
        service: {
          id: as.service.id,
          name: as.service.name,
          description: as.service.description,
          isFavorite: as.service.isFavorite,
        },
        employee: employee ? {
          id: employee.employee.id,
          name: employee.employee.name,
          photoUrl: employee.employee.photoUrl || undefined,
        } : undefined,
      };
    });
  }

  async addService(id: string, addServiceDto: AddAttendanceServiceDto, companyId: string): Promise<AttendanceServiceResponseDto> {
    const { serviceId, employeeId } = addServiceDto;
    
    const attendance = await this.findOne(id, companyId);

    if (attendance.completedAt) {
      throw new BadRequestException('Não é possível adicionar serviços a um atendimento já finalizado');
    }

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

    // Verificar se o serviço já está no atendimento
    const existingService = await this.prisma.attendanceService.findFirst({
      where: {
        attendanceId: id,
        serviceId,
      },
    });

    if (existingService) {
      throw new BadRequestException('Serviço já está incluído neste atendimento');
    }

    // Adicionar o serviço
    const attendanceService = await this.prisma.attendanceService.create({
      data: {
        attendanceId: id,
        serviceId,
      },
      include: {
        service: true,
      },
    });

    // Adicionar funcionário se especificado
    if (employeeId) {
      await this.prisma.attendanceEmployee.create({
        data: {
          attendanceId: id,
          employeeId,
          serviceId,
        },
      });
    }

    // Buscar dados do funcionário se adicionado
    const employee = employeeId ? await this.prisma.employee.findUnique({
      where: { id: employeeId },
    }) : null;

    return {
      id: attendanceService.id,
      service: {
        id: attendanceService.service.id,
        name: attendanceService.service.name,
        description: attendanceService.service.description,
        isFavorite: attendanceService.service.isFavorite,
      },
      employee: employee ? {
        id: employee.id,
        name: employee.name,
        photoUrl: employee.photoUrl || undefined,
      } : undefined,
    };
  }

  async removeService(id: string, serviceId: string, companyId: string): Promise<{ message: string }> {
    const attendance = await this.findOne(id, companyId);

    if (attendance.completedAt) {
      throw new BadRequestException('Não é possível remover serviços de um atendimento já finalizado');
    }

    // Verificar se há pelo menos 2 serviços (deve manter ao menos 1)
    const serviceCount = await this.prisma.attendanceService.count({
      where: { attendanceId: id },
    });

    if (serviceCount <= 1) {
      throw new BadRequestException('Não é possível remover o último serviço do atendimento');
    }

    // Remover o serviço
    const deleted = await this.prisma.attendanceService.deleteMany({
      where: {
        attendanceId: id,
        serviceId,
      },
    });

    if (deleted.count === 0) {
      throw new NotFoundException('Serviço não encontrado neste atendimento');
    }

    // Remover funcionário relacionado se existir
    await this.prisma.attendanceEmployee.deleteMany({
      where: {
        attendanceId: id,
        serviceId,
      },
    });

    return { message: 'Serviço removido do atendimento com sucesso' };
  }

  private formatAttendanceResponse(attendance: any): AttendanceResponseDto {
    // Mapear funcionários por serviço
    const employeesByService = new Map();
    if (attendance.employees) {
      attendance.employees.forEach(ae => {
        employeesByService.set(ae.serviceId, {
          id: ae.employee.id,
          name: ae.employee.name,
          photoUrl: ae.employee.photoUrl || undefined,
        });
      });
    }

    return {
      id: attendance.id,
      companyId: attendance.companyId,
      client: {
        id: attendance.client.id,
        name: attendance.client.name,
        phone: attendance.client.phone,
      },
      appointment: {
        id: attendance.appointment.id,
        appointmentDateStart: attendance.appointment.appointmentDateStart,
        appointmentDateEnd: attendance.appointment.appointmentDateEnd,
        status: attendance.appointment.status,
      },
      attendanceDate: attendance.attendanceDate,
      attendanceTime: attendance.attendanceTime,
      completedAt: attendance.completedAt,
      services: attendance.services.map(as => ({
        id: as.id,
        service: {
          id: as.service.id,
          name: as.service.name,
          description: as.service.description,
          isFavorite: as.service.isFavorite,
        },
        employee: employeesByService.get(as.serviceId),
      })),
      createdAt: attendance.createdAt,
      updatedAt: attendance.updatedAt,
    };
  }
}
