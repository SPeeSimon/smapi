import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AUTHENTICATION_PROPERTY = 'auth-user';

export const LoggedInUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request[AUTHENTICATION_PROPERTY] || request.user;
});
