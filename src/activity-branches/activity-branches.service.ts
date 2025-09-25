import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreateActivityBranchDto, 
  UpdateActivityBranchDto 
} from './dto/activity-branch.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ActivityBranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.prisma.activityBranch.findMany({
        skip,
        take: limitNum,
        orderBy: { name: 'asc' },
      }),
      this.prisma.activityBranch.count(),
    ]);

    return {
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const activityBranch = await this.prisma.activityBranch.findUnique({
      where: { id },
      include: {
        services: true,
      },
    });

    if (!activityBranch) {
      throw new NotFoundException('Ramo de atividade não encontrado');
    }

    return activityBranch;
  }

  async getDefaultServices(id: string) {
    const activityBranch = await this.prisma.activityBranch.findUnique({
      where: { id },
    });

    if (!activityBranch) {
      throw new NotFoundException('Ramo de atividade não encontrado');
    }

    const defaultServices = await this.prisma.defaultActivityService.findMany({
      where: { activityBranchId: id },
      orderBy: [
        { isFavoriteDefault: 'desc' },
        { name: 'asc' },
      ],
    });

    return defaultServices;
  }

  async create(createActivityBranchDto: CreateActivityBranchDto) {
    return this.prisma.activityBranch.create({
      data: createActivityBranchDto,
    });
  }

  async update(id: string, updateActivityBranchDto: UpdateActivityBranchDto) {
    const activityBranch = await this.prisma.activityBranch.findUnique({
      where: { id },
    });

    if (!activityBranch) {
      throw new NotFoundException('Ramo de atividade não encontrado');
    }

    return this.prisma.activityBranch.update({
      where: { id },
      data: updateActivityBranchDto,
    });
  }

  async remove(id: string) {
    const activityBranch = await this.prisma.activityBranch.findUnique({
      where: { id },
    });

    if (!activityBranch) {
      throw new NotFoundException('Ramo de atividade não encontrado');
    }

    await this.prisma.activityBranch.delete({
      where: { id },
    });

    return { message: 'Ramo de atividade excluído com sucesso' };
  }
}
