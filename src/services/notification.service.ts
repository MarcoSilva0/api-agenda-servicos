import { Injectable } from '@nestjs/common';
import { EmailTemplateService } from '../core/email-template.service';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly emailTemplateService: EmailTemplateService,
    private readonly mailerService: MailerService,
  ) {}

  /**
   * Envia email de confirmação de agendamento
   */
  async sendAppointmentConfirmation(appointmentData: {
    clientName: string;
    clientEmail: string;
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
    appointmentDate: string;
    appointmentTime: string;
    serviceName: string;
    servicePrice: string;
    employeeName: string;
  }) {
    try {
      const emailContent = this.emailTemplateService.renderTemplate('appointment-confirmation', {
        clientName: appointmentData.clientName,
        companyName: appointmentData.companyName,
        companyEmail: appointmentData.companyEmail,
        companyPhone: appointmentData.companyPhone,
        companyAddress: appointmentData.companyAddress,
        appointmentDate: appointmentData.appointmentDate,
        appointmentTime: appointmentData.appointmentTime,
        serviceName: appointmentData.serviceName,
        servicePrice: appointmentData.servicePrice,
        employeeName: appointmentData.employeeName,
      });

      await this.mailerService.sendEmail(
        appointmentData.clientEmail,
        `✅ Agendamento confirmado - ${appointmentData.companyName}`,
        emailContent,
      );

      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar confirmação de agendamento:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envia lembrete de agendamento
   */
  async sendAppointmentReminder(reminderData: {
    clientName: string;
    clientEmail: string;
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
    appointmentDate: string;
    appointmentTime: string;
    serviceName: string;
    servicePrice: string;
    serviceDuration: string;
    employeeName: string;
    confirmUrl?: string;
    rescheduleUrl?: string;
  }) {
    try {
      const emailContent = this.emailTemplateService.renderTemplate('appointment-reminder', {
        clientName: reminderData.clientName,
        companyName: reminderData.companyName,
        companyEmail: reminderData.companyEmail,
        companyPhone: reminderData.companyPhone,
        companyAddress: reminderData.companyAddress,
        appointmentDate: reminderData.appointmentDate,
        appointmentTime: reminderData.appointmentTime,
        serviceName: reminderData.serviceName,
        servicePrice: reminderData.servicePrice,
        serviceDuration: reminderData.serviceDuration,
        employeeName: reminderData.employeeName,
        confirmUrl: reminderData.confirmUrl || '#',
        rescheduleUrl: reminderData.rescheduleUrl || '#',
      });

      await this.mailerService.sendEmail(
        reminderData.clientEmail,
        `⏰ Lembrete: Agendamento amanhã - ${reminderData.companyName}`,
        emailContent,
      );

      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar lembrete de agendamento:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envia email de redefinição de senha
   */
  async sendPasswordReset(resetData: {
    userName: string;
    userEmail: string;
    companyName: string;
    resetUrl: string;
  }) {
    try {
      const emailContent = this.emailTemplateService.renderTemplate('password-reset', {
        userName: resetData.userName,
        companyName: resetData.companyName,
        resetUrl: resetData.resetUrl,
      });

      await this.mailerService.sendEmail(
        resetData.userEmail,
        `🔐 Redefinir senha - ${resetData.companyName}`,
        emailContent,
      );

      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar email de redefinição de senha:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Lista todos os templates disponíveis
   */
  getAvailableTemplates() {
    return this.emailTemplateService.getAvailableTemplates();
  }
}