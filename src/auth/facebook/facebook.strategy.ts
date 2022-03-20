import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { AuthService } from '../auth.service';
import { isUrl } from 'src/utils/validations';
import * as passport from 'passport';

const SYSTEM_FACEBOOK = 3;

@Injectable()
export class FacebookAuthStrategyService extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            clientID: process.env.AUTH_FACEBOOK_CLIENTID,
            clientSecret: process.env.AUTH_FACEBOOK_SECRET,
            callbackURL: `${process.env.API_URL}/auth/facebook/callback`,
            passReqToCallback: true,
            profileFields: ['id', 'displayName', 'email'], // 'photos', 'profile
        });
        Logger.log(`Facebook authentication using clientID ${process.env.AUTH_FACEBOOK_CLIENTID}`, 'Authentication');
        if (!isUrl(process.env.API_URL)) {
            throw new Error("Env property 'API_URL' used for Facebook authentication callback is not valid. Set a correct HTTP(s) url value or disable Facebook authentication.");
        }
    }

    async validate(request: any, accessToken, tokenSecret, profile): Promise<any> {
        const user = await this.authService.validateUser(SYSTEM_FACEBOOK, profile.emails[0].value);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
