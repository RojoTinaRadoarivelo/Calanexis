// MODEL
export class Users {
  id: string;
  email: string;
  password?: string;
  createdAt: Date;
  avatar: string;
  userName: string;
  preference: any;
}

// OUTPUTS
export const UsersOutputDto = {
  id: true,
  email: true,
  userName: true,
  avatar: true,
  isBlocked: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
};

export const CreatedUserOutputDto = {
  id: true,
  email: true,
  userName: true,
  avatar: true,
  createdAt: true,
};

export const UpdatedUserOutputDto = {
  email: true,
  userName: true,
  avatar: true,
  isBlocked: true,
  createdAt: true,
  updatedAt: true,
};
export const DeletedUserOutputDto = {
  email: true,
  userName: true,
  avatar: true,
  createdAt: true,
};
export const SearchUsersOutputDto = {
  email: true,
  userName: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
};
export const FilterUsersOutputDto = {
  id: true,
  email: true,
  userName: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
};
