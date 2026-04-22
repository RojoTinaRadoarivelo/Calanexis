import { HttpStatus } from '@nestjs/common';

export interface IResponse<T> {
  message?: string;
  data?: T | T[] | null;
  statusCode: HttpStatus;
  page?: number;
  total?: number;
  totalPages?: number;
}
