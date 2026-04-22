import { Global, Module } from '@nestjs/common';
import { IPrismaService } from './prisma.service';

@Global()
@Module({
  providers: [IPrismaService],
  exports: [IPrismaService],
})
export class PrismaModule {}
