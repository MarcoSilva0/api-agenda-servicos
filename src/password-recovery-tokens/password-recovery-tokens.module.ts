import { Module } from '@nestjs/common';
import { PasswordRecoveryTokensController } from './password-recovery-tokens.controller';
import { PasswordRecoveryTokensService } from './password-recovery-tokens.service';

@Module({
  controllers: [PasswordRecoveryTokensController],
  providers: [PasswordRecoveryTokensService]
})
export class PasswordRecoveryTokensModule {}
