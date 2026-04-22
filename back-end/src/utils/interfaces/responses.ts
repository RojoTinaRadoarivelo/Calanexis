import { HttpStatus } from '@nestjs/common';

export interface reponsesDTO<T> {
  statusCode: HttpStatus;
  message: string;
  data?: T | null;
}
