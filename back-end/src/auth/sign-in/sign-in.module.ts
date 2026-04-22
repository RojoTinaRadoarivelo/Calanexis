import { Module } from '@nestjs/common';
import { SignInService } from './sign-in.service';
import { SignInController } from './sign-in.controller';

import { JwtService } from '@nestjs/jwt';
import { SessionsService } from '../sessions/sessions.service';
import { UsersModule } from '../../features/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [SignInController],
  providers: [SignInService, JwtService, SessionsService],
})
export class SignInModule {}
