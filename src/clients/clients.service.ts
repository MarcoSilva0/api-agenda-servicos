import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreateClientDto, 
  UpdateClientDto, 
  ClientReportQueryDto, 
  ClientResponseDto,
  ClientReportResponseDto 
} from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto, companyId: string): Promise<ClientResponseDto> {
    const client = await this.prisma.client.create({
      data: {
        ...createClientDto,
        companyId,
      },
    });

    return this.formatClientResponse(client);
  }

  async findAll(companyId: string, page = 1, limit = 10): Promise<ClientReportResponseDto> {
    const skip = (page - 1) * limit;

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where: { companyId },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.client.count({
        where: { companyId },
      }),
    ]);

    return {
      clients: clients.map(client => this.formatClientResponse(client)),
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      itemsPerPage: limit,
    };
  }

  async findOne(id: string, companyId: string): Promise<ClientResponseDto> {
    const client = await this.prisma.client.findFirst({
      where: { 
        id,
        companyId,
      },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return this.formatClientResponse(client);
  }

  async update(id: string, updateClientDto: UpdateClientDto, companyId: string): Promise<ClientResponseDto> {
    const existingClient = await this.prisma.client.findFirst({
      where: { 
        id,
        companyId,
      },
    });

    if (!existingClient) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const client = await this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });

    return this.formatClientResponse(client);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const client = await this.prisma.client.findFirst({
      where: { 
        id,
        companyId,
      },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    await this.prisma.client.delete({
      where: { id },
    });
  }

  async getReport(query: ClientReportQueryDto, companyId: string): Promise<ClientReportResponseDto> {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    const where: any = { companyId };

    if (query.name) {
      where.name = {
        contains: query.name,
        mode: 'insensitive',
      };
    }

    const dateFilters: any = {};

    if (query.startDate) {
      dateFilters.gte = new Date(query.startDate);
    }

    if (query.endDate) {
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      dateFilters.lte = endDate;
    }

    if (query.month) {
      const month = parseInt(query.month);
      const year = query.year ? parseInt(query.year) : new Date().getFullYear();
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      
      dateFilters.gte = startDate;
      dateFilters.lte = endDate;
    } else if (query.year) {
      const year = parseInt(query.year);
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      
      dateFilters.gte = startDate;
      dateFilters.lte = endDate;
    }

    if (Object.keys(dateFilters).length > 0) {
      where.attendances = {
        some: {
          createdAt: dateFilters,
        },
      };
    }

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        include: {
          attendances: {
            select: {
              id: true,
              createdAt: true,
            },
            where: Object.keys(dateFilters).length > 0 ? { createdAt: dateFilters } : undefined,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      this.prisma.client.count({
        where,
      }),
    ]);

    return {
      clients: clients.map(client => ({
        ...this.formatClientResponse(client),
        lastAttendance: client.attendances[0]?.createdAt,
        totalAttendances: client.attendances.length,
      })),
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      itemsPerPage: limit,
    };
  }

  private formatClientResponse(client: any): ClientResponseDto {
    return {
      id: client.id,
      name: client.name,
      phone: client.phone,
      email: client.email,
      address: client.address,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }
}
