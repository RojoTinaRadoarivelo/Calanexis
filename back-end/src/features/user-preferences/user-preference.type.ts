// MODEL
export class Preferences {
  id: string;
  preferences: any;
  user_id: string;
  createdAt: Date;
}

// OUTPUTS
export const PreferencesOutputDto = {
  id: true,
  preferences: true,
  user_id: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
};

export const CreatedPreferenceOutputDto = {
  preferences: true,
  user_id: true,
  createdAt: true,
};

export const UpdatedPreferenceOutputDto = {
  preferences: true,
  user_id: true,
  createdAt: true,
  updatedAt: true,
};
export const DeletedPreferenceOutputDto = {
  preferences: true,
  user_id: true,
  createdAt: true,
};
export const SearchPreferencesOutputDto = {
  preferences: true,
  user_id: true,
  createdAt: true,
  updatedAt: true,
};
export const FilterPreferencesOutputDto = {
  id: true,
  preferences: true,
  user_id: true,
  createdAt: true,
  updatedAt: true,
};
