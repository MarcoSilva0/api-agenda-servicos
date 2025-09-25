import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../services/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
