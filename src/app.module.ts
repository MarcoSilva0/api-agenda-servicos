import { Module } from '@nestjs/common';
import { ActivityBranchesModule } from './activity-branches/activity-branches.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompaniesModule } from './companies/companies.module';
import { PasswordRecoveryTokensModule } from './password-recovery-tokens/password-recovery-tokens.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    CompaniesModule,
    UsersModule,
    ActivityBranchesModule,
    PasswordRecoveryTokensModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
