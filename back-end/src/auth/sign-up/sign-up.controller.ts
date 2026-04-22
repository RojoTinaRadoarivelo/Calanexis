import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';

import { SignUpService } from './sign-up.service';
import { SignUpDto } from '../interfaces/dtos/sign-up.dto';
import type { Response } from 'express';
import { GenericDtoValidatorPipe } from '../../shared/middlewares/pipes/generic-dto-validator.pipe';
import { cookieOptions } from '../../utils/cookies.util';
import { reponsesDTO } from '../../utils/interfaces/responses';

@Controller('auth')
export class SignUpController {
  constructor(private readonly _signUpService: SignUpService) {}

  @Post('sign-up')
  @UsePipes(new GenericDtoValidatorPipe(SignUpDto))
  async SignUp(
    @Body() data: SignUpDto,
    @Res() res: Response,
  ): Promise<reponsesDTO<{ sess_id: any }> | any> {
    let response: reponsesDTO<{ sess_id: any }>;
    const { email, code } = data;
    const sendmailVerification = this._signUpService.verifyCode(email, code);

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

    const newUserData = { email, password: data.password };

    const signUp = await this._signUpService.SignUp(newUserData);
    const statusCode = signUp.statusCode;
    const message = signUp.message;

    if (signUp.data) {
      res.cookie('accessToken', signUp.data.c_id, cookieOptions);
      response = {
        message,
        data: { sess_id: signUp.data.sess_id },
        statusCode,
      };
    } else {
      response = { statusCode, message };
    }
    return res.status(statusCode).json(response);
  }
}
