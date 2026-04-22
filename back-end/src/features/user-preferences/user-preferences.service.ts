import { Injectable } from '@nestjs/common';
import {
  CreatePreferenceDto,
  UpdatePreferenceDto,
} from './DTOs/preference.dto';
import {
  CreatedPreferenceOutputDto,
  DeletedPreferenceOutputDto,
  FilterPreferencesOutputDto,
  Preferences,
  PreferencesOutputDto,
  SearchPreferencesOutputDto,
  UpdatedPreferenceOutputDto,
} from './user-preference.type';
import { CrudService } from '../../core/crud/abstract-crud.service';
import { PreferenceRepository } from './user-preference.repository';

@Injectable()
export class UserPreferencesService extends CrudService<
  CreatePreferenceDto,
  UpdatePreferenceDto,
  Preferences
> {
  // default
  protected includeParams: any = PreferencesOutputDto;
  // crud include
  protected createIncludeParams: any = CreatedPreferenceOutputDto;
  protected updateIncludeParams: any = UpdatedPreferenceOutputDto;
  protected deleteIncludeParams: any = DeletedPreferenceOutputDto;
  protected searchIncludeParams: any = SearchPreferencesOutputDto;
  protected listFilterIncludeParams: any = FilterPreferencesOutputDto;
  constructor(repo: PreferenceRepository) {
    super(repo);
  }
}
