import { Module } from '@nestjs/common';
import { EmployeeServicePreferencesController } from './employee-service-preferences.controller';
import { EmployeeServicePreferencesService } from './employee-service-preferences.service';

@Module({
  controllers: [EmployeeServicePreferencesController],
  providers: [EmployeeServicePreferencesService]
})
export class EmployeeServicePreferencesModule {}
