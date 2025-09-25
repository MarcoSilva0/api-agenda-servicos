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
  Request,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ServicesService } from './services.service';
import { 
  CreateServiceDto, 
  UpdateServiceDto, 
  ImportServicesDto,
  SelectiveImportServicesDto,
  ServiceResponseDto,
  DefaultServiceResponseDto,
  CsvImportResultDto 
} from './dto/service.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Serviços')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Listar serviços da empresa',
    description: 'Lista todos os serviços da empresa do usuário logado (RF04)'
  })
  @ApiQuery({ name: 'favorites', required: false, type: Boolean, description: 'Filtrar apenas favoritos' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Incluir serviços desativados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de serviços',
    type: [ServiceResponseDto],
  })
  async findAll(
    @Request() req,
    @Query() paginationDto: PaginationDto,
    @Query('favorites') favorites?: boolean,
    @Query('includeInactive') includeInactive?: boolean,
  ) {
    return this.servicesService.findAll(req.user.companyId, paginationDto, favorites, includeInactive);
  }

  @Get('favorites')
  @ApiOperation({ 
    summary: 'Listar serviços favoritos',
    description: 'Lista apenas os serviços marcados como favoritos (RF04)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de serviços favoritos',
    type: [ServiceResponseDto],
  })
  async findFavorites(@Request() req) {
    return this.servicesService.findFavorites(req.user.companyId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Buscar serviço por ID',
    description: 'Retorna um serviço específico da empresa'
  })
  @ApiParam({ name: 'id', description: 'ID do serviço' })
  @ApiResponse({
    status: 200,
    description: 'Serviço encontrado',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Serviço não encontrado',
  })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.servicesService.findOne(id, req.user.companyId);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Criar novo serviço',
    description: 'Cria um novo serviço para a empresa (RF04)'
  })
  @ApiResponse({
    status: 201,
    description: 'Serviço criado com sucesso',
    type: ServiceResponseDto,
  })
  async create(@Request() req, @Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(req.user.companyId, createServiceDto);
  }

  @Post('import')
  @ApiOperation({ 
    summary: 'Importar todos os serviços do ramo de atividade',
    description: 'Importa todos os serviços comuns de um ramo de atividade (RF03)'
  })
  @ApiResponse({
    status: 201,
    description: 'Serviços importados com sucesso',
  })
  async importServices(@Request() req, @Body() importServicesDto: ImportServicesDto) {
    return this.servicesService.importServices(req.user.companyId, importServicesDto.activityBranchId);
  }

  @Get('available/:activityBranchId')
  @ApiOperation({ 
    summary: 'Listar serviços disponíveis do ramo de atividade',
    description: 'Lista todos os serviços disponíveis de um ramo de atividade, indicando quais já foram importados'
  })
  @ApiParam({ name: 'activityBranchId', description: 'ID do ramo de atividade' })
  @ApiResponse({
    status: 200,
    description: 'Lista de serviços disponíveis',
    type: [DefaultServiceResponseDto],
  })
  async getAvailableServices(
    @Request() req,
    @Param('activityBranchId') activityBranchId: string
  ) {
    return this.servicesService.getAvailableServices(req.user.companyId, activityBranchId);
  }

  @Post('import/selective')
  @ApiOperation({ 
    summary: 'Importar serviços selecionados do ramo de atividade',
    description: 'Importa apenas os serviços específicos escolhidos de um ramo de atividade (RF03)'
  })
  @ApiResponse({
    status: 201,
    description: 'Serviços selecionados importados com sucesso',
  })
  async importSelectedServices(@Request() req, @Body() selectiveImportDto: SelectiveImportServicesDto) {
    return this.servicesService.importSelectedServices(
      req.user.companyId, 
      selectiveImportDto.activityBranchId,
      selectiveImportDto.defaultServiceIds
    );
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Atualizar serviço',
    description: 'Atualiza os dados de um serviço (RF04)'
  })
  @ApiParam({ name: 'id', description: 'ID do serviço' })
  @ApiResponse({
    status: 200,
    description: 'Serviço atualizado com sucesso',
    type: ServiceResponseDto,
  })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, req.user.companyId, updateServiceDto);
  }

  @Put(':id/toggle-favorite')
  @ApiOperation({ 
    summary: 'Alternar favorito do serviço',
    description: 'Marca ou desmarca um serviço como favorito (RF04)'
  })
  @ApiParam({ name: 'id', description: 'ID do serviço' })
  @ApiResponse({
    status: 200,
    description: 'Status de favorito alterado com sucesso',
  })
  async toggleFavorite(@Request() req, @Param('id') id: string) {
    return this.servicesService.toggleFavorite(id, req.user.companyId);
  }

  @Put(':id/toggle-active')
  @ApiOperation({ 
    summary: 'Ativar/desativar serviço da empresa',
    description: 'Permite que a empresa desabilite serviços importados do sistema sem excluí-los'
  })
  @ApiParam({ name: 'id', description: 'ID do serviço' })
  @ApiResponse({
    status: 200,
    description: 'Status de ativo alterado com sucesso',
  })
  async toggleActive(@Request() req, @Param('id') id: string) {
    return this.servicesService.toggleActive(id, req.user.companyId);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Excluir serviço',
    description: 'Remove um serviço da empresa (RF04)'
  })
  @ApiParam({ name: 'id', description: 'ID do serviço' })
  @ApiResponse({
    status: 200,
    description: 'Serviço excluído com sucesso',
  })
  async remove(@Request() req, @Param('id') id: string) {
    return this.servicesService.remove(id, req.user.companyId);
  }

  @Post('import/csv')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Importar serviços via CSV',
    description: 'Importa serviços através de upload de arquivo CSV com colunas: nome, descrição'
  })
  @ApiResponse({
    status: 201,
    description: 'Resultado da importação do CSV',
    type: CsvImportResultDto,
  })
  async importCsv(
    @Request() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }), // 2MB
          new FileTypeValidator({ fileType: 'text/csv' }),
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    return this.servicesService.importFromCsv(req.user.companyId, file);
  }
}
