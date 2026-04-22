import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ForgotPasswordDto } from '../interfaces/dtos/forgot-pwd.dto';
import { AuthUserPresenter } from '../interfaces/presenters/auth-user.presenter';
import { SessionsService } from '../sessions/sessions.service';
import { MfaService } from '../mfa/mfa.service';
import { HashPassword } from '../../utils/interfaces/pwd-encryption';
import { reponsesDTO } from '../../utils/interfaces/responses';
import { UsersService } from '../../features/users/users.service';
import { Users } from '../../features/users/users.type';
import {
  DEFAULT_ERROR_MSG,
  USER_ERROR_MESSAGE,
} from '../interfaces/error-messages';
import { refreshConfig } from '../../core/configs/config';
import { IResponse } from '../../shared/interfaces/responses.interfaces';
import { assertSingle } from '../../utils/interfaces/assert-single.utils';

@Injectable()
export class ForgotPasswordService {
  refreshToken = refreshConfig.secret;
  refreshDuration: any = refreshConfig.duration;
  constructor(
    private readonly _userService: UsersService,
    private readonly _jwtService: JwtService,
    private readonly _sessionService: SessionsService,
    private readonly _mfaService: MfaService,
  ) {}

  async ForgotPwd(
    data: ForgotPasswordDto,
  ): Promise<reponsesDTO<{ c_id: any; sess_id: any }>> {
    let response: reponsesDTO<{ c_id: any; sess_id: any }>;
    const hashedPassword = await HashPassword(data.password, 10);
    data.password = hashedPassword;

    try {
      const searchUser: IResponse<Users | null> =
        await this._userService.Update(null, data, {
          email: data.email,
        });

      let user: Users | null;
      if (searchUser) {
        user = assertSingle(
          searchUser.data,
          'User not found or invalid result',
        );
      } else {
        throw new InternalServerErrorException(DEFAULT_ERROR_MSG.unexpected);
      }

      if (user) {
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
          let payload_session: any;
          let sess_id: string | null;
          if (userSessionId) {
            sess_id = userSessionId;
            payload_session = {
              sub: sess_id,
            };
          } else {
            sess_id = await this._sessionService.CreateSession(dataResponse.id);
            payload_session = {
              sub: sess_id,
            };
          }

          const sess_token = this._jwtService.sign(payload_session, {
            secret: this.refreshToken,
            expiresIn: this.refreshDuration,
          });

          await this._sessionService.UpdateSession(sess_id, sess_token);

          response = {
            message: 'The user password was reset successfuly!',
            data: { c_id, sess_id: sess_token },
            statusCode: HttpStatus.OK,
          };
        } else {
          throw new InternalServerErrorException(DEFAULT_ERROR_MSG.unexpected);
        }
      } else {
        throw new NotFoundException(USER_ERROR_MESSAGE.notfound);
      }
      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        response = {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        };
      } else if (error instanceof ConflictException) {
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
