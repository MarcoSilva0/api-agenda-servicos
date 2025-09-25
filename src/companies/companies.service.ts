import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateShareTemplateDto } from './dto/update-share-template.dto';
import { ShareTemplateResponseDto, AttendanceShareResponseDto } from './dto/share-response.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly DEFAULT_SHARE_TEMPLATE = `Atendimento realizado por {companyName}

📅 Data: {attendanceDate}
⚙️ Serviços: {services}
👤 Cliente: {clientName}
📞 Telefone: {clientPhone}

Agradecemos a confiança!`;

  async getShareTemplate(companyId: string): Promise<ShareTemplateResponseDto> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        customShareTemplate: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return {
      customShareTemplate: company.customShareTemplate || this.DEFAULT_SHARE_TEMPLATE,
      defaultTemplate: this.DEFAULT_SHARE_TEMPLATE,
      availableVariables: [
        '{companyName}',
        '{attendanceDate}',
        '{services}',
        '{clientName}',
        '{clientPhone}',
      ],
    };
  }

  async updateShareTemplate(companyId: string, updateDto: UpdateShareTemplateDto): Promise<ShareTemplateResponseDto> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        customShareTemplate: updateDto.customShareTemplate,
      },
    });

    return this.getShareTemplate(companyId);
  }

  async generateAttendanceShareText(attendanceId: string, companyId: string): Promise<AttendanceShareResponseDto> {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        client: true,
        appointment: true,
        services: {
          include: {
            service: true,
          },
        },
        company: true,
      },
    });

    if (!attendance) {
      throw new NotFoundException('Atendimento não encontrado');
    }

    if (attendance.companyId !== companyId) {
      throw new ForbiddenException('Atendimento não pertence à sua empresa');
    }

    if (!attendance.completedAt) {
      throw new ForbiddenException('Apenas atendimentos finalizados podem ser compartilhados');
    }

    const templateData = await this.getShareTemplate(companyId);
    const template = templateData.customShareTemplate;

    const serviceNames = attendance.services.map(as => as.service.name).join(', ');
    const attendanceDate = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(attendance.attendanceDate);

    const shareText = template
      .replace(/{companyName}/g, attendance.company.name)
      .replace(/{attendanceDate}/g, attendanceDate)
      .replace(/{services}/g, serviceNames)
      .replace(/{clientName}/g, attendance.client.name)
      .replace(/{clientPhone}/g, attendance.client.phone);

    return {
      shareText,
      attendanceId: attendance.id,
      sharedAt: new Date(),
    };
  }
}
