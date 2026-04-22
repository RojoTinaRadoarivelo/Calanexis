import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export class HttpExceptionUtil {
  static badRequest(message: string): void {
    throw new BadRequestException(message);
  }

  static unauthorized(message: string): void {
    throw new UnauthorizedException(message);
  }

  static forbidden(message: string): void {
    throw new ForbiddenException(message);
  }

  static notfound(message: string): void {
    throw new NotFoundException(message);
  }

  static conflict(message: string): void {
    throw new ConflictException(message);
  }

  static tooManyRequest(message: string): void {
    throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
  }

  static serviceUnvailable(message: string): void {
    throw new HttpException(message, HttpStatus.SERVICE_UNAVAILABLE);
  }
}
