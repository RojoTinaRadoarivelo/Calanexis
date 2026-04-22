import { Module } from '@nestjs/common';
import { UserPreferencesService } from './user-preferences.service';
import { UserPreferencesController } from './user-preferences.controller';
import { PreferenceRepository } from './user-preference.repository';

@Module({
  controllers: [UserPreferencesController],
  providers: [UserPreferencesService, PreferenceRepository],
  exports: [UserPreferencesService, PreferenceRepository],
})
export class UserPreferencesModule {}
