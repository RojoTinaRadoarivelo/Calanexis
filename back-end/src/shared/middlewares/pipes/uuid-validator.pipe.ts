import { Injectable, PipeTransform } from '@nestjs/common';
import { isUUID } from 'class-validator';

import { HttpExceptionUtil } from '../../../utils/http-exception.util';
import { ErrorMessages } from '../../interfaces/error-messages';

@Injectable()
export class UuidValidatorPipe implements PipeTransform {
  transform(value: string): string {
    if (!isUUID(value)) {
      HttpExceptionUtil.badRequest(ErrorMessages.INVALID_ID);
    }
    return value;
  }
}
