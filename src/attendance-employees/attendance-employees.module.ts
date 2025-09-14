import { Module } from '@nestjs/common';
import { AttendanceEmployeesController } from './attendance-employees.controller';
import { AttendanceEmployeesService } from './attendance-employees.service';

@Module({
  controllers: [AttendanceEmployeesController],
  providers: [AttendanceEmployeesService]
})
export class AttendanceEmployeesModule {}
