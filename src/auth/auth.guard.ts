import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AUTHENTICATION_PROPERTY } from './auth.module';

@Injectable()
export class CheckUserMiddleware implements NestMiddleware {
    constructor() {}

    use(req: Request, res: Response, next: NextFunction) {
        if (!(req[AUTHENTICATION_PROPERTY])) {
            res.redirect('/home');
        }
        next();
    }

}
