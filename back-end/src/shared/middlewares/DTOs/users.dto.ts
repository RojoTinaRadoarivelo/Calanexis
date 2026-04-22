import { PartialType } from '@nestjs/mapped-types';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { ErrorMessages } from '../../interfaces/error-messages';

export class CreateUserDto {
  @IsEmail(
    { allow_display_name: true },
    { message: ErrorMessages.INVALID_EMAIL },
  )
  @IsNotEmpty({ message: 'Le champ email est obligatoire' })
  email: string;

  @IsOptional()
  @IsStrongPassword(
    {
      minLength: 10,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    { message: ErrorMessages.NOT_STRONG_PWD },
  )
  @IsString({ message: ErrorMessages.INVALID_TYPE })
  password?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.INVALID_TYPE })
  userName?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.INVALID_TYPE })
  avatar?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
