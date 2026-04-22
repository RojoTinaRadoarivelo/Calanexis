import { IsNotEmpty, IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ErrorMessages } from '../../../shared/interfaces/error-messages';

export class CreatePreferenceDto {
  @IsUUID('4', { message: ErrorMessages.INVALID_ID })
  @IsNotEmpty({ message: ErrorMessages.REQUIRED })
  user_id: string;
  @IsNotEmpty({ message: ErrorMessages.REQUIRED })
  preferences: any;
}

export class UpdatePreferenceDto extends PartialType(CreatePreferenceDto) {}
