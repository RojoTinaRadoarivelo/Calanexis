import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';

import { ForgotPasswordService } from './forgot-password.service';
import { ForgotPasswordDto } from '../interfaces/dtos/forgot-pwd.dto';
import { GenericDtoValidatorPipe } from '../../shared/middlewares/pipes/generic-dto-validator.pipe';
import { cookieOptions } from '../../utils/cookies.util';
import { reponsesDTO } from '../../utils/interfaces/responses';

@Controller('auth')
export class ForgotPasswordController {
  constructor(private readonly _forgotPasswordService: ForgotPasswordService) {}

  @Post('forgot-password')
  @UsePipes(new GenericDtoValidatorPipe(ForgotPasswordDto))
  async ForgotPassword(
    @Body() data: ForgotPasswordDto,
    @Res() res: Response,
  ): Promise<reponsesDTO<{ sess_id: string }> | any> {
    let response: reponsesDTO<{ sess_id: string }>;

    const { email, code } = data;

    const sendmailVerification = this._forgotPasswordService.verifyCode(
      email,
      code,
    );

    let mailstatusCode = sendmailVerification.statusCode;
    const mailverificationMessage = sendmailVerification.message;

    if (mailstatusCode !== HttpStatus.OK) {
      mailstatusCode = HttpStatus.BAD_REQUEST;
      response = {
        message: mailverificationMessage,
        statusCode: mailstatusCode,
      };
      return res.status(mailstatusCode).json(response);
    }

    const forgotPwd = await this._forgotPasswordService.ForgotPwd(data);
    const statusCode = forgotPwd.statusCode;
    const message = forgotPwd.message;

    if (forgotPwd.data) {
      res.cookie('accessToken', forgotPwd.data.c_id, cookieOptions);
      response = {
        message,
        data: { sess_id: forgotPwd.data.sess_id },
        statusCode,
      };
    } else {
      response = { statusCode, message };
    }
    return res.status(statusCode).json(response);
  }
}
