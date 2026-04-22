import {
  IsNotEmpty,
  IsString,
  IsEmail,
  Length,
  IsBooleanString,
} from 'class-validator';
import { ErrorMessages } from '../../../shared/interfaces/error-messages';

export class SendVerificationCodeDto {
  @IsNotEmpty({ message: ErrorMessages.REQUIRED })
  @IsString({ message: ErrorMessages.INVALID_TYPE })
  @IsEmail(
    { allow_display_name: true },
    { message: ErrorMessages.INVALID_EMAIL },
  )
  email: string;
  @IsNotEmpty({ message: ErrorMessages.REQUIRED })
  @IsBooleanString({ message: ErrorMessages.INVALID_TYPE })
  crf: string;
}

export class VerificationCodeDto {
  @IsNotEmpty({ message: ErrorMessages.REQUIRED })
  @IsString({ message: ErrorMessages.INVALID_TYPE })
  @IsEmail(
    { allow_display_name: true },
    { message: ErrorMessages.INVALID_TYPE },
  )
  email: string;
  @IsNotEmpty({ message: ErrorMessages.REQUIRED })
  @IsString({ message: ErrorMessages.INVALID_TYPE })
  @Length(8, 8)
  code: string;
}
