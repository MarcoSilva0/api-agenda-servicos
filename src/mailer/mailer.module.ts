import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MailerModule as NodeMailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    NodeMailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.MAIL_HOST,
          secure: true,
          port: process.env.MAIL_PORT
            ? Number(process.env.MAIL_PORT)
            : undefined,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
          },
        },
      }),
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}