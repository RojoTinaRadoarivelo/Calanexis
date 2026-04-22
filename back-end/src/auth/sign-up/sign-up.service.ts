import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { MfaService } from '../mfa/mfa.service';
import { JwtService } from '@nestjs/jwt';
import { AuthUserPresenter } from '../interfaces/presenters/auth-user.presenter';
import { SessionsService } from '../sessions/sessions.service';

import { reponsesDTO } from '../../utils/interfaces/responses';
import { UsersService } from '../../features/users/users.service';
import { HashPassword } from '../../utils/interfaces/pwd-encryption';
import { verifyObject } from '../../utils/class-validation.util';
import { Users } from '../../features/users/users.type';
import {
  DEFAULT_ERROR_MSG,
  USER_ERROR_MESSAGE,
} from '../interfaces/error-messages';
import { refreshConfig } from '../../core/configs/config';
import { IResponse } from '../../shared/interfaces/responses.interfaces';
import { assertSingle } from '../../utils/interfaces/assert-single.utils';

@Injectable()
export class SignUpService {
  refreshToken = refreshConfig.secret;
  refreshDuration: any = refreshConfig.duration;
  constructor(
    private readonly _mfaService: MfaService,
    private readonly _userService: UsersService,
    private readonly _jwtService: JwtService,
    private readonly _sessionService: SessionsService,
  ) {}

  async SignUp(data: {
    email: string;
    password: string;
  }): Promise<reponsesDTO<{ c_id: any; sess_id: any }>> {
    let response: reponsesDTO<{ c_id: any; sess_id: any }>;
    try {
      const hashedPassword = await HashPassword(data.password, 10);
      data.password = hashedPassword;
      const userName: string = data.email.split('@')[0];

      const newUser: IResponse<Users | null> = await this._userService.Create({
        ...data,
        userName,
      });
      let user: Users | null;
      if (newUser) {
        user = assertSingle(newUser.data, 'User not saved or invalid result');
      } else {
        throw new InternalServerErrorException(DEFAULT_ERROR_MSG.unexpected);
      }

      if (user && verifyObject<Users>(user, Users)) {
        const userPresenter: AuthUserPresenter = new AuthUserPresenter();
        const dataResponse = userPresenter.present(user);

        if (dataResponse) {
          const payload = {
            sub: dataResponse.id,
            mail: dataResponse.email,
            avatar: dataResponse.avatar,
          };
          const c_id = this._jwtService.sign(payload, {
            secret: process.env.TOKEN_SECRET,
          });
          const userSessionId = await this._sessionService.searchSessionByUser(
            dataResponse.id,
          );
          let payload_session: { sub: string };
          let sess_id: string | null;
          if (userSessionId) {
            sess_id = userSessionId;
            payload_session = {
              sub: sess_id,
            };
          } else {
            sess_id = await this._sessionService.CreateSession(dataResponse.id);
            payload_session = {
              sub: sess_id ?? '',
            };
          }

          const sess_token = this._jwtService.sign(payload_session, {
            secret: this.refreshToken,
            expiresIn: this.refreshDuration,
          });

          await this._sessionService.UpdateSession(sess_id, sess_token);

          response = {
            message: 'The user was signed up successfuly!',
            data: { c_id, sess_id: sess_token },
            statusCode: HttpStatus.OK,
          };
          return response;
        } else {
          throw new InternalServerErrorException(DEFAULT_ERROR_MSG.unexpected);
        }
      } else {
        throw new BadRequestException(USER_ERROR_MESSAGE.notSaved);
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        response = {
          statusCode: HttpStatus.CONFLICT,
          message: error.message,
        };
      } else if (error instanceof BadRequestException) {
        response = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        };
      } else {
        response = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        };
      }
      return response;
    }
  }

  verifyCode(email: string, code: string): reponsesDTO<object | null> {
    return this._mfaService.verifyCode(email, code);
  }
}
