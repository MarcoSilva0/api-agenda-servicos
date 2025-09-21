import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CompaniesModule } from './companies/companies.module';
import { UsersModule } from './users/users.module';
import { ActivityBranchesModule } from './activity-branches/activity-branches.module';
import { ServicesModule } from './services/services.module';
import { EmployeesModule } from './employees/employees.module';
import { EmployeeServicePreferencesModule } from './employee-service-preferences/employee-service-preferences.module';
import { ClientsModule } from './clients/clients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AttendancesModule } from './attendances/attendances.module';
import { AttendanceServicesModule } from './attendance-services/attendance-services.module';
import { AttendanceEmployeesModule } from './attendance-employees/attendance-employees.module';
import { PasswordRecoveryTokensModule } from './password-recovery-tokens/password-recovery-tokens.module';
import { DefaultActivityServicesModule } from './default-activity-services/default-activity-services.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    CompaniesModule,
    UsersModule,
    ActivityBranchesModule,
    ServicesModule,
    EmployeesModule,
    EmployeeServicePreferencesModule,
    ClientsModule,
    AppointmentsModule,
    AttendancesModule,
    AttendanceServicesModule,
    AttendanceEmployeesModule,
    PasswordRecoveryTokensModule,
    DefaultActivityServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
