import { Module } from '@nestjs/common';
import { SignInModule } from './sign-in/sign-in.module';
import { SignUpModule } from './sign-up/sign-up.module';
import { ForgotPasswordModule } from './forgot-password/forgot-password.module';
import { MfaModule } from './mfa/mfa.module';
import { SignOutModule } from './sign-out/sign-out.module';
import { UsersModule } from '../features/users/users.module';

@Module({
  imports: [
    UsersModule,
    SignInModule,
    SignUpModule,
    ForgotPasswordModule,
    MfaModule,
    SignOutModule,
  ],

  exports: [SignInModule, SignUpModule, ForgotPasswordModule, MfaModule],
})
export class AuthModule {}
