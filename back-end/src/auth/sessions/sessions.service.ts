import { Injectable } from '@nestjs/common';

import { IPrismaService } from '../../core/configs/interfaces/prisma-ripository/prisma.service';

@Injectable()
export class SessionsService {
  private readonly userSessionsPrisma: any;
  private readonly selectFields: any = {
    id: true,
    token: true,
    user: {
      select: {
        id: true,
        email: true,
      },
    },
    createdAt: true,
    updatedAt: true,
  };
  constructor(private readonly _dbService: IPrismaService) {
    this.userSessionsPrisma = _dbService.prisma.userSessions;
  }
  async UpdateSession(
    id: string | null,
    token: string,
  ): Promise<string | null> {
    if (id) {
      await this.userSessionsPrisma.update({
        where: { id },
        data: { token },
        select: this.selectFields,
      });
      return id;
    }
    return null;
  }

  async UpdateDetailedSession(id: string, token: string): Promise<any> {
    const updatedSession = await this.userSessionsPrisma.update({
      where: { id },
      data: { token },
      select: this.selectFields,
    });
    return updatedSession;
  }

  async CreateSession(user_id: string): Promise<string | null> {
    const newSessionUser = await this.userSessionsPrisma.create({
      data: { user: { connect: { id: user_id } } },
      select: this.selectFields,
    });
    return newSessionUser.id;
  }

  async searchSessionByUser(id: string): Promise<string | null> {
    const sessionUser = await this.userSessionsPrisma.findFirst({
      where: {
        user_id: id,
      },
      select: this.selectFields,
    });
    if (sessionUser) {
      return sessionUser.id;
    }
    return null;
  }

  async searchSessionById(id: string): Promise<string | null> {
    const sessionUser = await this.userSessionsPrisma.findFirst({
      where: {
        id,
      },
      select: this.selectFields,
    });
    if (sessionUser) {
      return sessionUser.id;
    }
    return null;
  }
}
