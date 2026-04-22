import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        const httpContext = context.switchToHttp();
        const res = httpContext.getResponse();

        if (response?.statusCode) {
          res.status(response.statusCode);
        }
        return response?.data ?? response; // old : response.data
      }),
    );
  }
}
