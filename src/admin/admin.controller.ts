import { 
  Controller, 
  Post, 
  UseGuards,
  Request,
  Get
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';

@ApiTags('Administração')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('migrate-services')
  @ApiOperation({ 
    summary: 'Migrar serviços para empresas existentes',
    description: 'Importa os serviços padrão do ramo de atividade para todas as empresas que não possuem serviços ainda'
  })
  @ApiResponse({
    status: 200,
    description: 'Migração concluída com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        totalCompanies: { type: 'number' },
        companiesUpdated: { type: 'number' },
        servicesCreated: { type: 'number' },
        details: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              companyId: { type: 'string' },
              companyName: { type: 'string' },
              branchName: { type: 'string' },
              servicesAdded: { type: 'number' }
            }
          }
        }
      }
    }
  })
  async migrateServicesForExistingCompanies(@Request() req) {
    return this.adminService.migrateServicesForAllCompanies();
  }

  @Get('companies-status')
  @ApiOperation({ 
    summary: 'Status das empresas e seus serviços',
    description: 'Lista todas as empresas com informações sobre quantos serviços cada uma possui'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de empresas com status',
    schema: {
      type: 'object',
      properties: {
        totalCompanies: { type: 'number' },
        companiesWithServices: { type: 'number' },
        companiesWithoutServices: { type: 'number' },
        companies: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              activityBranchName: { type: 'string' },
              servicesCount: { type: 'number' },
              hasServices: { type: 'boolean' }
            }
          }
        }
      }
    }
  })
  async getCompaniesStatus(@Request() req) {
    return this.adminService.getCompaniesStatus();
  }
}