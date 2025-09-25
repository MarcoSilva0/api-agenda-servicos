import { Injectable } from '@nestjs/common';
import { MailerService as NodeMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  constructor(private mailerService: NodeMailerService) {}

  async sendEmail(email: string, subject: string, message: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: process.env.MAIL_USER,
        subject,
        html: message,
      });
      return {
        success: true,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
      };
    }
  }
}