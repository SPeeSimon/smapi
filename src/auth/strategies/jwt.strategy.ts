import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_CONSTANTS } from '../auth.module';
import { AUTHENTICATION_PROPERTY } from "../loggedinuser";
import { AuthService } from '../auth.service';

export const AUTH_ID = 99;

@Injectable()
export class JwtAuthenticationStrategyService extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // ignoreExpiration: false,
            secretOrKey: JWT_CONSTANTS.secret(),
            requestProperty: AUTHENTICATION_PROPERTY,
        });
    }

    async validate(payload: JwtPayload) {
        Logger.debug(`authenticated with token ${payload}`, 'Authentication');
        return { author: payload.sub, authenticationMethods: []};
    }
}
