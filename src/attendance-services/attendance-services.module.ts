import { Module } from '@nestjs/common';
import { AttendanceServicesController } from './attendance-services.controller';
import { AttendanceServicesService } from './attendance-services.service';

@Module({
  controllers: [AttendanceServicesController],
  providers: [AttendanceServicesService]
})
export class AttendanceServicesModule {}
