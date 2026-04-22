import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';

import { MfaService } from './mfa.service';
import {
  SendVerificationCodeDto,
  VerificationCodeDto,
} from '../interfaces/dtos/verification-code.dto';
import { GenericDtoValidatorPipe } from '../../shared/middlewares/pipes/generic-dto-validator.pipe';
import { reponsesDTO } from '../../utils/interfaces/responses';
import { UsersService } from 'src/features/users/users.service';
import { USER_ERROR_MESSAGE } from '../interfaces/error-messages';

@Controller('auth')
export class MfaController {
  constructor(
    private readonly _mfaService: MfaService,
    private readonly _userService: UsersService,
  ) {}

  @Get('google/redirect')
  RedirectGoogle(@Query('code') code?: string, @Query('error') error?: string) {
    return { code: code || null, error: error || null };
  }
  @Post('send-verification-code')
  @UsePipes(new GenericDtoValidatorPipe(SendVerificationCodeDto))
  async SendVerification(
    @Body() data: SendVerificationCodeDto,
  ): Promise<reponsesDTO<object | null>> {
    let sendmailVerification: any;
    if (data.crf) {
      const userFound = await this._userService.FindOne({ email: data.email });
      sendmailVerification =
        userFound.statusCode == HttpStatus.NOT_FOUND
          ? await this._mfaService.SendVerificationCode(data.email)
          : null;
    } else {
      sendmailVerification = await this._mfaService.SendVerificationCode(
        data.email,
      );
    }

    if (!sendmailVerification) {
      throw new ConflictException(USER_ERROR_MESSAGE.alreadyExist);
    }
    const statusCode = sendmailVerification.statusCode;
    const message = sendmailVerification.message;

    const response: reponsesDTO<object | null> = { statusCode, message };

    return response;
  }
  @Post('verify-code')
  @UsePipes(new GenericDtoValidatorPipe(VerificationCodeDto))
  VerifyCode(@Body() data: VerificationCodeDto): reponsesDTO<object | null> {
    const sendmailVerification = this._mfaService.verifyCode(
      data.email,
      data.code,
    );

    const statusCode = sendmailVerification.statusCode;
    const message = sendmailVerification.message;

    const response: reponsesDTO<object | null> = { statusCode, message };

    return response;
  }
}
