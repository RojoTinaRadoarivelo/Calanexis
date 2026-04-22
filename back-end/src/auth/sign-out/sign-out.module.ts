import { Module } from '@nestjs/common';
import { SignOutService } from './sign-out.service';
import { SignOutController } from './sign-out.controller';

@Module({
  controllers: [SignOutController],
  providers: [SignOutService],
})
export class SignOutModule {}
