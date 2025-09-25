import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import * as csv from 'csv-parser';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    companyId: string,
    paginationDto: PaginationDto,
    favorites?: boolean,
  ) {
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
        orderBy: [{ isFavorite: 'desc' }, { name: 'asc' }],
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
        isSystemDefault: false, // Serviços criados pela empresa não são do sistema
      },
    });
  }

  async importServices(companyId: string, activityBranchId: string) {
    const defaultServices = await this.prisma.defaultActivityService.findMany({
      where: { activityBranchId },
    });

    if (defaultServices.length === 0) {
      return {
        message: 'Nenhum serviço encontrado para este ramo de atividade',
      };
    }

    const existingServices = await this.prisma.service.findMany({
      where: {
        companyId,
        isFromActivityBranch: true,
        activityBranchId,
      },
    });

    const existingServiceNames = existingServices.map((s) =>
      s.name.toLowerCase(),
    );

    const servicesToImport = defaultServices.filter(
      (defaultService) =>
        !existingServiceNames.includes(defaultService.name.toLowerCase()),
    );

    if (servicesToImport.length === 0) {
      return { message: 'Todos os serviços deste ramo já foram importados' };
    }

    const importedServices = await this.prisma.service.createMany({
      data: servicesToImport.map((defaultService) => ({
        companyId,
        name: defaultService.name,
        description: defaultService.description,
        isFavorite: defaultService.isFavoriteDefault,
        isFromActivityBranch: true,
        isSystemDefault: true, // Serviços importados do ramo são do sistema
        activityBranchId,
      })),
    });

    return {
      message: `${importedServices.count} serviços importados com sucesso`,
      count: importedServices.count,
    };
  }

  async getAvailableServices(companyId: string, activityBranchId: string) {
    // Buscar todos os serviços padrão do ramo de atividade
    const defaultServices = await this.prisma.defaultActivityService.findMany({
      where: { activityBranchId },
      orderBy: { name: 'asc' },
    });

    if (defaultServices.length === 0) {
      throw new NotFoundException('Nenhum serviço encontrado para este ramo de atividade');
    }

    // Buscar serviços já importados pela empresa
    const existingServices = await this.prisma.service.findMany({
      where: {
        companyId,
        isFromActivityBranch: true,
        activityBranchId,
      },
    });

    const existingServiceNames = existingServices.map((s) => s.name.toLowerCase());

    // Retornar serviços com indicação de já importados
    return defaultServices.map((defaultService) => ({
      id: defaultService.id,
      name: defaultService.name,
      description: defaultService.description,
      isFavoriteDefault: defaultService.isFavoriteDefault,
      alreadyImported: existingServiceNames.includes(defaultService.name.toLowerCase()),
    }));
  }

  async importSelectedServices(companyId: string, activityBranchId: string, defaultServiceIds: string[]) {
    // Verificar se os serviços padrão existem
    const defaultServices = await this.prisma.defaultActivityService.findMany({
      where: {
        id: { in: defaultServiceIds },
        activityBranchId,
      },
    });

    if (defaultServices.length === 0) {
      throw new NotFoundException('Nenhum serviço encontrado com os IDs fornecidos');
    }

    if (defaultServices.length !== defaultServiceIds.length) {
      throw new BadRequestException('Alguns IDs de serviços são inválidos ou não pertencem ao ramo de atividade');
    }

    // Verificar serviços já importados
    const existingServices = await this.prisma.service.findMany({
      where: {
        companyId,
        isFromActivityBranch: true,
        activityBranchId,
      },
    });

    const existingServiceNames = existingServices.map((s) => s.name.toLowerCase());

    const servicesToImport = defaultServices.filter(
      (defaultService) =>
        !existingServiceNames.includes(defaultService.name.toLowerCase()),
    );

    if (servicesToImport.length === 0) {
      return { 
        message: 'Todos os serviços selecionados já foram importados',
        imported: 0,
        skipped: defaultServices.length,
      };
    }

    const importedServices = await this.prisma.service.createMany({
      data: servicesToImport.map((defaultService) => ({
        companyId,
        name: defaultService.name,
        description: defaultService.description,
        isFavorite: defaultService.isFavoriteDefault,
        isFromActivityBranch: true,
        isSystemDefault: true, // Serviços importados do ramo são do sistema
        activityBranchId,
      })),
    });

    return {
      message: `${importedServices.count} serviços importados com sucesso`,
      imported: importedServices.count,
      skipped: defaultServices.length - importedServices.count,
      total: defaultServices.length,
    };
  }

  async update(
    id: string,
    companyId: string,
    updateServiceDto: UpdateServiceDto,
  ) {
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

  async importFromCsv(companyId: string, file: Express.Multer.File) {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const errors: string[] = [];
      let imported = 0;
      let failed = 0;
      let lineNumber = 1; // Começar da linha 1 (header)

      const stream = require('stream');
      const bufferStream = new stream.PassThrough();
      bufferStream.end(file.buffer);

      bufferStream
        .pipe(csv({
          headers: ['nome', 'descricao'], // Mapear colunas esperadas
        }))
        .on('data', (data) => {
          lineNumber++;
          
          // Pular linhas vazias
          if (!data.nome && !data.descricao) {
            return;
          }
          
          // Validar dados
          const nome = data.nome?.trim();
          const descricao = data.descricao?.trim();

          if (!nome) {
            errors.push(`Linha ${lineNumber}: Nome é obrigatório`);
            failed++;
            return;
          }

          if (!descricao) {
            errors.push(`Linha ${lineNumber}: Descrição é obrigatória`);
            failed++;
            return;
          }

          results.push({
            name: nome,
            description: descricao,
          });
        })
        .on('end', async () => {
          try {
            // Verificar se há dados válidos para importar
            if (results.length === 0) {
              resolve({
                imported: 0,
                failed: failed,
                errors: errors.length > 0 ? errors : ['Nenhum dado válido encontrado no CSV'],
                message: 'Nenhum serviço foi importado',
              });
              return;
            }

            // Verificar serviços já existentes para evitar duplicatas
            const existingServices = await this.prisma.service.findMany({
              where: {
                companyId,
                name: {
                  in: results.map(r => r.name),
                },
              },
            });

            const existingNames = existingServices.map(s => s.name.toLowerCase());
            
            // Filtrar serviços que não existem
            const servicesToCreate = results.filter(
              result => !existingNames.includes(result.name.toLowerCase())
            );

            const duplicatesCount = results.length - servicesToCreate.length;
            
            if (duplicatesCount > 0) {
              errors.push(`${duplicatesCount} serviços já existem e foram ignorados`);
            }

            // Criar serviços em lote
            if (servicesToCreate.length > 0) {
              const createdServices = await this.prisma.service.createMany({
                data: servicesToCreate.map((result) => ({
                  companyId,
                  name: result.name,
                  description: result.description,
                  isFavorite: false,
                  isFromActivityBranch: false,
                  isSystemDefault: false, // Serviços do CSV não são do sistema
                })),
              });

              imported = createdServices.count;
            }

            resolve({
              imported,
              failed,
              errors,
              message: `${imported} serviços importados com sucesso${failed > 0 ? `, ${failed} falharam` : ''}`,
            });

          } catch (error) {
            reject(new BadRequestException('Erro ao processar CSV: ' + error.message));
          }
        })
        .on('error', (error) => {
          reject(new BadRequestException('Erro ao ler CSV: ' + error.message));
        });
    });
  }
}
