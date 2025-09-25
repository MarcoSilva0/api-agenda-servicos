import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppointmentReminderService } from './appointment-reminder.service';
import { AppointmentsModule } from '../appointments/appointments.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    AppointmentsModule,
    PrismaModule,
  ],
  providers: [AppointmentReminderService],
  exports: [AppointmentReminderService],
})
export class TasksModule {}
