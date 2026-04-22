import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';

@Injectable()
export class IPrismaService implements OnModuleInit, OnModuleDestroy {
  private client: PrismaClient;
  constructor() {
    this.client = new PrismaClient();
  }
  get prisma() {
    return this.client;
  }
  async onModuleInit() {
    await this.client.$connect();
  }
  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
