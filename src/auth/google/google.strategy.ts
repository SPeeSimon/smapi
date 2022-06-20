import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { OAuth2Strategy } from 'passport-google-oauth';
import { AuthService } from '../auth.service';
import { isUrl } from 'src/shared/validations/validations';
import { AuthenticationDetails } from '../auth.module';
import { SYSTEM_GOOGLE } from './google.module';


@Injectable()
export class GoogleAuthStrategyService extends PassportStrategy(OAuth2Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            clientID: process.env.AUTH_GOOGLE_CLIENTID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            callbackURL: `${process.env.API_URL}/auth/google/callback`,
            passReqToCallback: true,
            scope: ['email'], // 'email', 'profile', 'openid'
        });
        Logger.log(`Google authentication using clientID ${process.env.AUTH_GOOGLE_CLIENTID}`, 'Authentication');
        if (!isUrl(process.env.API_URL)) {
            throw new Error("Env property 'API_URL' used for Google authentication callback is not valid. Set a correct HTTP(s) url value or disable Google authentication.");
        }
    }

    async validate(request: any, accessToken, tokenSecret, profile): Promise<any> {
        console.log('github callback with user', request.user, 'profile', profile);
        const user = await this.authService.findUserAuthentication(SYSTEM_GOOGLE, profile.emails[0].value);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
