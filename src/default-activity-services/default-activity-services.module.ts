import { Module } from '@nestjs/common';
import { DefaultActivityServicesController } from './default-activity-services.controller';
import { DefaultActivityServicesService } from './default-activity-services.service';

@Module({
  controllers: [DefaultActivityServicesController],
  providers: [DefaultActivityServicesService]
})
export class DefaultActivityServicesModule {}
