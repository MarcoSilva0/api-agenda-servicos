import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async migrateServicesForAllCompanies() {
    const companies = await this.prisma.company.findMany({
      include: {
        activityBranch: true,
        services: true,
      },
    });

    if (companies.length === 0) {
      return {
        message: 'Nenhuma empresa encontrada na base',
        totalCompanies: 0,
        companiesUpdated: 0,
        servicesCreated: 0,
        details: [],
      };
    }

    const details: Array<{
      companyId: string;
      companyName: string;
      branchName: string;
      servicesAdded: number;
      status: string;
    }> = [];
    let companiesUpdated = 0;
    let totalServicesCreated = 0;

    for (const company of companies) {
      try {
        // Verificar se a empresa já tem serviços
        if (company.services.length > 0) {
          details.push({
            companyId: company.id,
            companyName: company.name,
            branchName: company.activityBranch.name,
            servicesAdded: 0,
            status: 'já possui serviços',
          });
          continue;
        }

        // Buscar serviços padrão do ramo de atividade
        const defaultServices = await this.prisma.defaultActivityService.findMany({
          where: { activityBranchId: company.activityBranchId },
        });

        if (defaultServices.length === 0) {
          details.push({
            companyId: company.id,
            companyName: company.name,
            branchName: company.activityBranch.name,
            servicesAdded: 0,
            status: 'nenhum serviço padrão encontrado para o ramo',
          });
          continue;
        }

        // Criar serviços para a empresa
        const createdServices = await this.prisma.service.createMany({
          data: defaultServices.map((defaultService) => ({
            companyId: company.id,
            name: defaultService.name,
            description: defaultService.description,
            isFavorite: defaultService.isFavoriteDefault,
            isActive: true,
            isFromActivityBranch: true,
            isSystemDefault: true,
            activityBranchId: company.activityBranchId,
          })),
        });

        details.push({
          companyId: company.id,
          companyName: company.name,
          branchName: company.activityBranch.name,
          servicesAdded: createdServices.count,
          status: 'serviços adicionados com sucesso',
        });

        companiesUpdated++;
        totalServicesCreated += createdServices.count;

        console.log(`✅ Empresa '${company.name}' atualizada com ${createdServices.count} serviços`);
      } catch (error) {
        details.push({
          companyId: company.id,
          companyName: company.name,
          branchName: company.activityBranch.name,
          servicesAdded: 0,
          status: `erro: ${error.message}`,
        });
        console.error(`❌ Erro ao migrar serviços para empresa '${company.name}':`, error.message);
      }
    }

    return {
      message: `Migração concluída. ${companiesUpdated} empresas atualizadas de ${companies.length} total.`,
      totalCompanies: companies.length,
      companiesUpdated,
      servicesCreated: totalServicesCreated,
      details,
    };
  }

  async getCompaniesStatus() {
    const companies = await this.prisma.company.findMany({
      include: {
        activityBranch: true,
        services: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const companiesWithServices = companies.filter(c => c.services.length > 0).length;
    const companiesWithoutServices = companies.length - companiesWithServices;

    const companiesStatus = companies.map(company => ({
      id: company.id,
      name: company.name,
      activityBranchName: company.activityBranch.name,
      servicesCount: company.services.length,
      hasServices: company.services.length > 0,
      systemServices: company.services.filter(s => s.isSystemDefault).length,
      customServices: company.services.filter(s => !s.isSystemDefault).length,
      activeServices: company.services.filter(s => s.isActive).length,
    }));

    return {
      totalCompanies: companies.length,
      companiesWithServices,
      companiesWithoutServices,
      companies: companiesStatus,
    };
  }
}