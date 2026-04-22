import { Users } from '../../../features/users/users.type';
import { Presenter } from '../../../shared/interfaces/presenter.interfaces';
import { verifyObject } from '../../../utils/class-validation.util';
import { SignedUserDto } from '../dtos/signed-user.dto';

export class AuthUserPresenter implements Presenter<Users, SignedUserDto> {
  present(data: Users): SignedUserDto | null {
    let response: SignedUserDto | null;

    if (data instanceof Users || verifyObject<Users>(data, Users)) {
      const preferences = data.preference
        ? { id: data.preference.id, ...data.preference?.preferences }
        : null;
      response = {
        id: data.id,
        email: data.email,
        avatar: data.avatar ?? '',
        userName: data.userName ?? '',
        preference: preferences,
      };
    } else {
      response = null;
    }
    return response;
  }
}
