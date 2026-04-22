import { PipeTransform } from '@nestjs/common';
import { isUUID } from 'class-validator';

import { HttpExceptionUtil } from '../../../utils/http-exception.util';
import { ErrorMessages } from '../../interfaces/error-messages';

export class UuidParamValidatorPipe implements PipeTransform {
  transform(value: string): string {
    if (!isUUID(value)) {
      HttpExceptionUtil.badRequest(ErrorMessages.INVALID_ID);
    }
    return value;
  }
}
