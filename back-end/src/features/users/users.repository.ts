import { Injectable } from '@nestjs/common';
import { PrismaCrudRepository } from '../../core/configs/interfaces/prisma-ripository/prisma.repository';
import { IPrismaService } from '../../core/configs/interfaces/prisma-ripository/prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
} from '../../shared/middlewares/DTOs/users.dto';
import { Users } from './users.type';

@Injectable()
export class UserRepository extends PrismaCrudRepository<
  'users',
  CreateUserDto,
  UpdateUserDto,
  Users
> {
  constructor(prisma: IPrismaService) {
    super(prisma, 'users');
  }
  // override possible async findMany(args?: any) { return super.findMany({ ...args, where: { isActive: true }, }); }
}
