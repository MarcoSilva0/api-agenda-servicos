import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CoreModule } from '../core/core.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [CoreModule, MailerModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}