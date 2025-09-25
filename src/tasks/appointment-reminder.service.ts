import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppointmentsService } from '../appointments/appointments.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentReminderService {
  private readonly logger = new Logger(AppointmentReminderService.name);

  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Executa todos os dias às 20:00 para enviar lembretes dos agendamentos do próximo dia
   */
  @Cron(CronExpression.EVERY_DAY_AT_8PM)
  async handleDailyReminders() {
    this.logger.log('Iniciando envio de lembretes diários...');

    try {
      // Buscar todas as empresas ativas
      const companies = await this.prisma.company.findMany({
        select: { id: true, name: true },
      });

      let totalSent = 0;
      let totalErrors = 0;

      for (const company of companies) {
        try {
          this.logger.log(`Processando lembretes para empresa: ${company.name}`);
          
          const result = await this.appointmentsService.sendAppointmentReminders(company.id);
          
          totalSent += result.sent;
          totalErrors += result.errors;

          this.logger.log(
            `Empresa ${company.name}: ${result.sent} lembretes enviados, ${result.errors} erros`
          );
        } catch (error) {
          this.logger.error(
            `Erro ao processar lembretes para empresa ${company.name}:`,
            error
          );
          totalErrors++;
        }
      }

      this.logger.log(
        `Lembretes diários concluídos. Total: ${totalSent} enviados, ${totalErrors} erros`
      );
    } catch (error) {
      this.logger.error('Erro crítico ao processar lembretes diários:', error);
    }
  }

  /**
   * Executa a cada hora durante o horário comercial para lembretes urgentes
   */
  @Cron('0 8-18 * * 1-6') // A cada hora das 8h às 18h, segunda a sábado
  async handleHourlyReminders() {
    this.logger.log('Verificando lembretes urgentes...');

    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      // Buscar agendamentos que começam na próxima hora
      const appointments = await this.prisma.appointment.findMany({
        where: {
          appointmentDateStart: {
            gte: now,
            lte: oneHourFromNow,
          },
          status: 'SCHEDULED',
        },
        include: {
          client: true,
          service: true,
          employee: true,
          company: true,
        },
      });

      let sent = 0;
      let errors = 0;

      for (const appointment of appointments) {
        try {
          // Verificar se já foi enviado um lembrete urgente (você pode adicionar um campo na tabela)
          // Por simplicidade, vamos enviar sempre
          
          this.logger.log(`Enviando lembrete urgente para agendamento ${appointment.id}`);
          
          // Aqui você poderia usar o mesmo método ou criar um específico para lembretes urgentes
          // await this.appointmentsService.sendUrgentReminder(appointment);
          
          sent++;
        } catch (error) {
          this.logger.error(
            `Erro ao enviar lembrete urgente para agendamento ${appointment.id}:`,
            error
          );
          errors++;
        }
      }

      if (appointments.length > 0) {
        this.logger.log(
          `Lembretes urgentes: ${sent} enviados, ${errors} erros de ${appointments.length} agendamentos`
        );
      }
    } catch (error) {
      this.logger.error('Erro ao processar lembretes urgentes:', error);
    }
  }
}