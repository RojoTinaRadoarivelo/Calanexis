import { Module } from '@nestjs/common';

import { MfaController } from './mfa.controller';
import { MfaService } from './mfa.service';
import { SMTPUtil } from '../../utils/smtp.util';
import { UsersModule } from 'src/features/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [MfaController],
  providers: [MfaService, SMTPUtil],
  exports: [MfaService, SMTPUtil],
})
export class MfaModule {}
