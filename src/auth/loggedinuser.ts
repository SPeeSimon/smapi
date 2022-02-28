import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AUTHENTICATION_PROPERTY } from './auth.module';

export const LoggedInUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()
    return request[AUTHENTICATION_PROPERTY] || request.user;
  },
);