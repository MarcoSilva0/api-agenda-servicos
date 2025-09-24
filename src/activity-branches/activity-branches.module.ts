import { Module } from '@nestjs/common';
import { ActivityBranchesController } from './activity-branches.controller';
import { ActivityBranchesService } from './activity-branches.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActivityBranchesController],
  providers: [ActivityBranchesService],
  exports: [ActivityBranchesService],
})
export class ActivityBranchesModule {}
