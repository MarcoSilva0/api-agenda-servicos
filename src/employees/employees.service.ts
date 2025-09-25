import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto/update-employee.dto';
import { ServicePreferenceDto } from './dto/service-preference.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where: { companyId },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          servicePreferences: {
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.employee.count({ where: { companyId } }),
    ]);

    const employees = data.map((employee) => ({
      ...employee,
      photoUrl: employee.photoUrl ?? undefined,
      preferredServices: employee.servicePreferences.map(
        (pref) => pref.service,
      ),
      servicePreferences: undefined,
    }));

    return {
      data: employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId: string): Promise<EmployeeResponseDto> {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        servicePreferences: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    if (employee.companyId !== companyId) {
      throw new ForbiddenException('Funcionário não pertence à sua empresa');
    }

    return {
      ...employee,
      photoUrl: employee.photoUrl ?? undefined,
      preferredServices: employee.servicePreferences.map(
        (pref) => pref.service,
      ),
      servicePreferences: undefined,
    } as EmployeeResponseDto;
  }

  async create(
    createEmployeeDto: CreateEmployeeDto,
    companyId: string,
  ): Promise<EmployeeResponseDto> {
    const employee = await this.prisma.employee.create({
      data: {
        ...createEmployeeDto,
        companyId,
      },
      include: {
        servicePreferences: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    return {
      ...employee,
      photoUrl: employee.photoUrl ?? undefined,
      preferredServices: employee.servicePreferences.map(
        (pref) => pref.service,
      ),
      servicePreferences: undefined,
    } as EmployeeResponseDto;
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
    companyId: string,
  ): Promise<EmployeeResponseDto> {
    const employee = await this.findOne(id, companyId);

    const updatedEmployee = await this.prisma.employee.update({
      where: { id },
      data: updateEmployeeDto,
      include: {
        servicePreferences: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    return {
      ...updatedEmployee,
      photoUrl: updatedEmployee.photoUrl ?? undefined,
      preferredServices: updatedEmployee.servicePreferences.map(
        (pref) => pref.service,
      ),
      servicePreferences: undefined,
    } as EmployeeResponseDto;
  }

  async remove(id: string, companyId: string) {
    const employee = await this.findOne(id, companyId);

    await this.prisma.employeeServicePreference.deleteMany({
      where: { employeeId: id },
    });

    await this.prisma.employee.delete({
      where: { id },
    });

    return { message: 'Colaborador excluído com sucesso' };
  }

  async getServicePreferences(employeeId: string, companyId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        servicePreferences: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    if (employee.companyId !== companyId) {
      throw new ForbiddenException('Funcionário não pertence à sua empresa');
    }

    return employee.servicePreferences.map((pref) => pref.service);
  }

  async setServicePreferences(
    employeeId: string,
    servicePreferenceDto: ServicePreferenceDto,
    companyId: string,
  ) {
    const employee = await this.findOne(employeeId, companyId);

    const services = await this.prisma.service.findMany({
      where: {
        id: { in: servicePreferenceDto.serviceIds },
        companyId,
      },
    });

    if (services.length !== servicePreferenceDto.serviceIds.length) {
      throw new NotFoundException('Um ou mais serviços não foram encontrados');
    }

    await this.prisma.employeeServicePreference.deleteMany({
      where: { employeeId },
    });

    if (servicePreferenceDto.serviceIds.length > 0) {
      await this.prisma.employeeServicePreference.createMany({
        data: servicePreferenceDto.serviceIds.map((serviceId) => ({
          employeeId,
          serviceId,
        })),
      });
    }

    return {
      message: 'Preferências de serviço atualizadas com sucesso',
      servicePreferences: services.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description || undefined,
      })),
    };
  }

  async findByServicePreference(companyId: string, serviceId: string) {
    const employees = await this.prisma.employee.findMany({
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

    return employees;
  }
}
