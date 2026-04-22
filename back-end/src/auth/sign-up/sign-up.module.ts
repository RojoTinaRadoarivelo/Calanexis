import { Module } from '@nestjs/common';
import { SignUpService } from './sign-up.service';
import { SignUpController } from './sign-up.controller';

import { JwtService } from '@nestjs/jwt';
import { SessionsService } from '../sessions/sessions.service';
import { MfaModule } from '../mfa/mfa.module';
import { UsersModule } from '../../features/users/users.module';

@Module({
  imports: [UsersModule, MfaModule],
  controllers: [SignUpController],
  providers: [SignUpService, JwtService, SessionsService],
})
export class SignUpModule {}
