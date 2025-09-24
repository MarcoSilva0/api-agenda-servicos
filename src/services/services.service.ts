import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, paginationDto: PaginationDto, favorites?: boolean) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where = {
      companyId,
      ...(favorites && { isFavorite: true }),
    };

    const [data, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isFavorite: 'desc' },
          { name: 'asc' },
        ],
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findFavorites(companyId: string) {
    return this.prisma.service.findMany({
      where: {
        companyId,
        isFavorite: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    if (service.companyId !== companyId) {
      throw new ForbiddenException('Acesso negado ao serviço');
    }

    return service;
  }

  async create(companyId: string, createServiceDto: CreateServiceDto) {
    return this.prisma.service.create({
      data: {
        ...createServiceDto,
        companyId,
        isFromActivityBranch: false,
      },
    });
  }

  async importServices(companyId: string, activityBranchId: string) {
    // Buscar serviços padrão do ramo de atividade
    const defaultServices = await this.prisma.defaultActivityService.findMany({
      where: { activityBranchId },
    });

    if (defaultServices.length === 0) {
      return { message: 'Nenhum serviço encontrado para este ramo de atividade' };
    }

    // Verificar quais serviços já existem para evitar duplicatas
    const existingServices = await this.prisma.service.findMany({
      where: {
        companyId,
        isFromActivityBranch: true,
        activityBranchId,
      },
    });

    const existingServiceNames = existingServices.map(s => s.name.toLowerCase());

    // Filtrar serviços que não existem ainda
    const servicesToImport = defaultServices.filter(
      defaultService => !existingServiceNames.includes(defaultService.name.toLowerCase())
    );

    if (servicesToImport.length === 0) {
      return { message: 'Todos os serviços deste ramo já foram importados' };
    }

    // Importar serviços em lote
    const importedServices = await this.prisma.service.createMany({
      data: servicesToImport.map(defaultService => ({
        companyId,
        name: defaultService.name,
        description: defaultService.description,
        isFavorite: defaultService.isFavoriteDefault,
        isFromActivityBranch: true,
        activityBranchId,
      })),
    });

    return {
      message: `${importedServices.count} serviços importados com sucesso`,
      count: importedServices.count,
    };
  }

  async update(id: string, companyId: string, updateServiceDto: UpdateServiceDto) {
    const service = await this.findOne(id, companyId);

    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }

  async toggleFavorite(id: string, companyId: string) {
    const service = await this.findOne(id, companyId);

    const updatedService = await this.prisma.service.update({
      where: { id },
      data: { isFavorite: !service.isFavorite },
    });

    return {
      message: `Serviço ${updatedService.isFavorite ? 'marcado' : 'desmarcado'} como favorito`,
      isFavorite: updatedService.isFavorite,
    };
  }

  async remove(id: string, companyId: string) {
    const service = await this.findOne(id, companyId);

    await this.prisma.service.delete({
      where: { id },
    });

    return { message: 'Serviço excluído com sucesso' };
  }
}
