import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { Api_Action, API_MESSAGE_KEY } from '../decorators/api-message';

@Injectable()
export class ApiMessageInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const action = this.reflector.get<Api_Action>(
      API_MESSAGE_KEY,
      context.getHandler(),
    );

    if (!action) {
      return next.handle();
    }

    const controllerName = context.getClass().name.replace('Controller', '');
    const messageMap: Record<Api_Action, string> = {
      create: `${controllerName} was created successfully`,
      update: `${controllerName} was updated successfully`,
      delete: `${controllerName} was deleted successfully`,
      list: `List of ${controllerName}`,
      createMany: `${controllerName} were created successfully`,
      updateMany: `${controllerName} were updated successfully`,
      deleteMany: `${controllerName} were deleted successfully`,
      search: `List of ${controllerName} for the query`,
      bin: `${controllerName} was moved to bin successfully`,
    };

    return next.handle().pipe(
      map((response) => {
        const httpContext = context.switchToHttp();
        const res = httpContext.getResponse();

        if (response?.statusCode) {
          res.status(response.statusCode);
        }

        return {
          statusCode: response.statusCode ?? 200,
          message: response.message || messageMap[action],
          data: response.data || null,
          ...(response.page !== undefined && { page: response.page }),
          ...(response.total !== undefined && { total: response.total }),
          ...(response.totalPages !== undefined && {
            totalPages: response.totalPages,
          }),
        };
      }),
    );
  }
}
