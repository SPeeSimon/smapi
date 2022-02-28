import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { EntityNotFoundError, TypeORMError } from "typeorm";
import { Request, Response } from 'express';

const NOT_FOUND = 404;
const INTERNAL_SERVER_ERROR = 500;

@Catch(TypeORMError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: TypeORMError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    Logger.error(`Request {${request.originalUrl}} from ${request.ip} resulted in an error. Exception was: ${exception.message}`, 'TypeORM');
    if (exception instanceof EntityNotFoundError) {
        return this.sendError(response, NOT_FOUND, `Entity not found`);
    }
    return this.sendError(response, INTERNAL_SERVER_ERROR, 'Error with database layer');
  }

  sendError(response: Response, status: number, message: string) {
    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        message: message,
      });
  }
}