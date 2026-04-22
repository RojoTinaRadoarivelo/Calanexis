import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { HttpExceptionUtil } from '../../../utils/http-exception.util';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();

    if (!req.user) {
      HttpExceptionUtil.unauthorized('You must be logged in');
    }

    return true;
  }
}
