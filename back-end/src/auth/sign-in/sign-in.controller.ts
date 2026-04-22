import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';

import { SignInService } from './sign-in.service';
import { SignInDto } from '../interfaces/dtos/sign-in.dto';
import { SignedUserDto } from '../interfaces/dtos/signed-user.dto';
import { GenericDtoValidatorPipe } from '../../shared/middlewares/pipes/generic-dto-validator.pipe';
import { EmailParamValidatorPipe } from '../../shared/middlewares/validators/email-parm.validator';
import { cookieOptions } from '../../utils/cookies.util';
import { reponsesDTO } from '../../utils/interfaces/responses';

@Controller('auth')
export class SignInController {
  constructor(private readonly _signInService: SignInService) {}

  @Post('sign-in')
  @UsePipes(new GenericDtoValidatorPipe(SignInDto))
  async SignIn(
    @Body() data: SignInDto,
    @Res() res: Response,
  ): Promise<reponsesDTO<{ sess_id: any }> | any> {
    let response: reponsesDTO<{ sess_id: any }>;

    const signIn = await this._signInService.SignIn(data);
    const statusCode = signIn.statusCode;
    const message = signIn.message;

    if (signIn.data) {
      res.cookie('accessToken', signIn.data.c_id, cookieOptions);
      response = {
        message,
        data: { sess_id: signIn.data.sess_id },
        statusCode,
      };
    } else {
      response = { statusCode, message };
    }
    return res.status(statusCode).json(response);
  }

  @Post('refresh')
  async refresh(
    @Body() body: { sess_id: string },
    @Res() res: Response,
  ): Promise<reponsesDTO<{ sess_id: any }> | any> {
    let response: reponsesDTO<{ sess_id: any }>;
    const authorization = body.sess_id ?? null;
    if (!authorization) {
      return res.status(403).json({
        message: "You're not authorized or expired token.",
        statusCode: 403,
      });
    }
    const accessToken = await this._signInService.refresh(authorization);
    const statusCode = accessToken.statusCode;
    const message = accessToken.message;

    if (accessToken.data) {
      res.cookie('accessToken', accessToken.data.c_id, cookieOptions);
      response = {
        message,
        data: { sess_id: accessToken.data.sess_id },
        statusCode,
      };
    } else {
      response = { statusCode, message };
    }
    return res.status(statusCode).json(response);
  }

  @Get('search/user/:email')
  async SearchUserByEmail(
    @Param('email', EmailParamValidatorPipe) email: string,
  ): Promise<reponsesDTO<SignedUserDto>> {
    return await this._signInService.SearchUserByEmail(email);
  }
}
