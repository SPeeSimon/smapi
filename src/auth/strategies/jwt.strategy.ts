import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTHENTICATION_PROPERTY, JWT_CONSTANTS } from '../auth.module';
import { AuthService } from '../auth.service';

export const AUTH_ID = 99;

@Injectable()
export class JwtAuthenticationStrategyService extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // ignoreExpiration: false,
            secretOrKey: JWT_CONSTANTS.secret,
            requestProperty: AUTHENTICATION_PROPERTY,
        });
    }

    async validate(payload: JwtPayload) {
        console.log('authenticated with token', payload);
        return { author: payload.sub, authenticationMethods: []};
    }
}
