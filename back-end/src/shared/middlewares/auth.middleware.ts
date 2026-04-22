import { Injectable, NestMiddleware } from '@nestjs/common';

import * as jwt from 'jsonwebtoken';
import { cookieOptions } from '../../utils/cookies.util';
import { UsersService } from '../../features/users/users.service';
import { FilterUsersOutputDto } from '../../features/users/users.type';
import { UserPreferencesService } from '../../features/user-preferences/user-preferences.service';
import { DEFAULT_ERROR_MSG } from '../../auth/interfaces/error-messages';
import { Preferences } from '../../features/user-preferences/user-preference.type';
import { assertSingle } from '../../utils/interfaces/assert-single.utils';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly _userService: UsersService,
    private readonly _preferenceService: UserPreferencesService,
  ) {}
  async use(req: any, res: any, next: () => void): Promise<void> {
    const authCookie = req.cookies['accessToken'];

    req.user = null;
    try {
      if (!authCookie) {
        return next();
      }

      const decoded: any = jwt.verify(authCookie, process.env.TOKEN_SECRET!);

      if (!decoded) {
        res.clearCookie('accessToken', cookieOptions);

        return next();
      }

      const user_id = decoded.sub;
      let user: any;
      if (user_id) {
        user = await this.findUser(user_id, null);
      } else {
        user = await this.findUser(null, { email: decoded.mail });
      }

      if (user?.data && typeof FilterUsersOutputDto == typeof user.data) {
        req.user = user.data;
        const preferenceResponse = await this.findPreference(user.data.id);

        let foundPreference: Preferences | null = null;
        if (preferenceResponse) {
          foundPreference = assertSingle(
            preferenceResponse.data,
            'pref not found or invalid result',
          );
        } else {
          console.log(DEFAULT_ERROR_MSG.unexpected);
        }

        req.user.preference = foundPreference
          ? {
              id: foundPreference.id,
              preferences: foundPreference.preferences,
            }
          : null;
      } else {
        res.clearCookie('accessToken', cookieOptions);
        req.user = null;
      }
    } catch (error) {
      console.log('Invalid token:', error.message);
    }
    next();
  }
  private async findUser(id: string | null, query: any): Promise<any> {
    return await this._userService.FindOne(query ?? { id });
  }
  private async findPreference(user_id: string) {
    return await this._preferenceService.FindOne({ user_id, isDeleted: false });
  }
}
