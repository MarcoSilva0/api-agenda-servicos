import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CompaniesModule } from './companies/companies.module';
import { UsersModule } from './users/users.module';
import { ActivityBranchesModule } from './activity-branches/activity-branches.module';
import { ServicesModule } from './services/services.module';
import { EmployeesModule } from './employees/employees.module';
import { ClientsModule } from './clients/clients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AttendancesModule } from './attendances/attendances.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from './mailer/mailer.module';
import { CoreModule } from './core/core.module';
import { NotificationModule } from './services/notification.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    CompaniesModule,
    UsersModule,
    ActivityBranchesModule,
    ServicesModule,
    EmployeesModule,
    ClientsModule,
    AppointmentsModule,
    AttendancesModule,
    AuthModule,
    MailerModule,
    CoreModule,
    NotificationModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
