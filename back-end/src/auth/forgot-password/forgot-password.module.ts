import { Module } from '@nestjs/common';
import { ForgotPasswordService } from './forgot-password.service';
import { ForgotPasswordController } from './forgot-password.controller';

import { JwtService } from '@nestjs/jwt';
import { SessionsService } from '../sessions/sessions.service';
import { MfaModule } from '../mfa/mfa.module';
import { UsersModule } from '../../features/users/users.module';

@Module({
  imports: [UsersModule, MfaModule],
  controllers: [ForgotPasswordController],
  providers: [ForgotPasswordService, JwtService, SessionsService],
})
export class ForgotPasswordModule {}
