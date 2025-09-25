import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Public } from 'src/auth/decorators/public.decorator';
import { ActivityBranchesService } from './activity-branches.service';
import {
  CreateActivityBranchDto,
  UpdateActivityBranchDto,
  ActivityBranchResponseDto,
} from './dto/activity-branch.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Ramos de Atividade')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activity-branches')
export class ActivityBranchesController {
  constructor(
    private readonly activityBranchesService: ActivityBranchesService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Listar ramos de atividade',
    description: 'Lista todos os ramos de atividade disponíveis (RF03) - Endpoint público',
  })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: 'Lista de ramos de atividade',
    type: [ActivityBranchResponseDto],
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.activityBranchesService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar ramo de atividade por ID',
    description: 'Retorna um ramo de atividade específico',
  })
  @ApiParam({ name: 'id', description: 'ID do ramo de atividade' })
  @ApiResponse({
    status: 200,
    description: 'Ramo de atividade encontrado',
    type: ActivityBranchResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ramo de atividade não encontrado',
  })
  async findOne(@Param('id') id: string) {
    return this.activityBranchesService.findOne(id);
  }

  @Get(':id/default-services')
  @ApiOperation({
    summary: 'Listar serviços padrão do ramo',
    description: 'Lista serviços comuns do ramo de atividade (RF03)',
  })
  @ApiParam({ name: 'id', description: 'ID do ramo de atividade' })
  @ApiResponse({
    status: 200,
    description: 'Lista de serviços padrão do ramo',
  })
  async getDefaultServices(@Param('id') id: string) {
    return this.activityBranchesService.getDefaultServices(id);
  }

  @Public()
  @Post()
  @ApiOperation({
    summary: 'Criar novo ramo de atividade',
    description: 'Cria um novo ramo de atividade no sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Ramo de atividade criado com sucesso',
    type: ActivityBranchResponseDto,
  })
  async create(@Body() createActivityBranchDto: CreateActivityBranchDto) {
    return this.activityBranchesService.create(createActivityBranchDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar ramo de atividade',
    description: 'Atualiza os dados de um ramo de atividade',
  })
  @ApiParam({ name: 'id', description: 'ID do ramo de atividade' })
  @ApiResponse({
    status: 200,
    description: 'Ramo de atividade atualizado com sucesso',
    type: ActivityBranchResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateActivityBranchDto: UpdateActivityBranchDto,
  ) {
    return this.activityBranchesService.update(id, updateActivityBranchDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Excluir ramo de atividade',
    description: 'Remove um ramo de atividade do sistema',
  })
  @ApiParam({ name: 'id', description: 'ID do ramo de atividade' })
  @ApiResponse({
    status: 200,
    description: 'Ramo de atividade excluído com sucesso',
  })
  async remove(@Param('id') id: string) {
    return this.activityBranchesService.remove(id);
  }
}
