import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { SignInDto } from '../interfaces/dtos/sign-in.dto';
import { JwtService } from '@nestjs/jwt';

import { AuthUserPresenter } from '../interfaces/presenters/auth-user.presenter';
import { SessionsService } from '../sessions/sessions.service';
import { SignedUserDto } from '../interfaces/dtos/signed-user.dto';
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
import { ComparePasswords } from '../../utils/interfaces/pwd-encryption';

@Injectable()
export class SignInService {
  refreshToken = refreshConfig.secret;
  refreshDuration: any = refreshConfig.duration;
  constructor(
    private readonly _userService: UsersService,
    private readonly _jwtService: JwtService,
    private readonly _sessionService: SessionsService,
  ) {}

  async SignIn(
    data: SignInDto,
  ): Promise<reponsesDTO<{ c_id: any; sess_id: any }>> {
    let response: reponsesDTO<{ c_id: any; sess_id: any }>;
    try {
      const searchUser: IResponse<Users | null> =
        await this._userService.FindOne(
          {
            email: data.email,
          },
          {
            id: true,
            email: true,
            userName: true,
            password: true,
            avatar: true,
            createdAt: true,
            updatedAt: true,
          },
        );

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
        const isMatch = await ComparePasswords(data.password, user.password);

        if (!isMatch) {
          throw new BadRequestException('Invalid credentials');
        }

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
            message: 'The user was signed in successfuly!',
            data: { c_id, sess_id: sess_token },
            statusCode: HttpStatus.OK,
          };
          return response;
        } else {
          throw new InternalServerErrorException(DEFAULT_ERROR_MSG.unexpected);
        }
      } else {
        throw new NotFoundException(USER_ERROR_MESSAGE.notfound);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        response = {
          statusCode: HttpStatus.NOT_FOUND,
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

  async refresh(
    token: string,
  ): Promise<reponsesDTO<{ c_id: any; sess_id: any }>> {
    let response: reponsesDTO<{ c_id: any; sess_id: any }>;
    const decoded: { sub: string } = this._jwtService.decode(token);

    const userSessionId = await this._sessionService.searchSessionById(
      decoded.sub,
    );
    let payload_session: { sub: string };
    let sess_id: string;
    if (userSessionId) {
      sess_id = userSessionId;
      payload_session = {
        sub: sess_id,
      };
    } else {
      response = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'The user is not found',
      };
      return response;
    }

    const sess_token = this._jwtService.sign(payload_session, {
      secret: this.refreshToken,
      expiresIn: this.refreshDuration,
    });

    const updated = await this._sessionService.UpdateDetailedSession(
      sess_id,
      sess_token,
    );

    try {
      const searchUser: IResponse<Users | null> =
        await this._userService.FindOne({ id: updated.user.id });

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

          return {
            message: 'The token was refresh successfuly!',
            data: { c_id, sess_id: sess_token },
            statusCode: HttpStatus.OK,
          };
        } else {
          throw new InternalServerErrorException(DEFAULT_ERROR_MSG.unexpected);
        }
      } else {
        throw new NotFoundException(USER_ERROR_MESSAGE.notfound);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        response = {
          statusCode: HttpStatus.NOT_FOUND,
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

  async SearchUserByEmail(email: string): Promise<reponsesDTO<SignedUserDto>> {
    let response: reponsesDTO<SignedUserDto>;
    try {
      const searchUser: IResponse<Users | null> =
        await this._userService.FindOne({
          email,
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
          response = {
            message: 'The user was found!',
            data: dataResponse,
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
}
