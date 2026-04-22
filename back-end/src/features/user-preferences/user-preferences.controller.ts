import { Controller } from '@nestjs/common';
import { UserPreferencesService } from './user-preferences.service';
import {
  CreatePreferenceDto,
  UpdatePreferenceDto,
} from './DTOs/preference.dto';
import { Preferences } from './user-preference.type';
import { CrudController } from '../../core/crud/abstract-crud.controller';

@Controller('user-preferences')
export class UserPreferencesController extends CrudController<
  CreatePreferenceDto,
  UpdatePreferenceDto,
  Preferences
> {
  constructor(private readonly userPreferencesService: UserPreferencesService) {
    super(userPreferencesService);
  }

  protected getCreateDto() {
    return CreatePreferenceDto;
  }

  protected getUpdateDto() {
    return UpdatePreferenceDto;
  }
}
