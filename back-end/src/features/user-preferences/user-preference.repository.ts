import { Injectable } from '@nestjs/common';
import { PrismaCrudRepository } from '../../core/configs/interfaces/prisma-ripository/prisma.repository';
import { IPrismaService } from '../../core/configs/interfaces/prisma-ripository/prisma.service';
import {
  CreatePreferenceDto,
  UpdatePreferenceDto,
} from './DTOs/preference.dto';
import { Preferences } from './user-preference.type';

@Injectable()
export class PreferenceRepository extends PrismaCrudRepository<
  'userPreferences',
  CreatePreferenceDto,
  UpdatePreferenceDto,
  Preferences
> {
  constructor(prisma: IPrismaService) {
    super(prisma, 'userPreferences');
  }
  // override possible async findMany(args?: any) { return super.findMany({ ...args, where: { isActive: true }, }); }
}
