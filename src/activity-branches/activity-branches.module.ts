import { Module } from '@nestjs/common';
import { ActivityBranchesController } from './activity-branches.controller';
import { ActivityBranchesService } from './activity-branches.service';

@Module({
  controllers: [ActivityBranchesController],
  providers: [ActivityBranchesService]
})
export class ActivityBranchesModule {}
