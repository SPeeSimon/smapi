import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { OAuth2Strategy } from 'passport-google-oauth';
import { AuthService } from '../auth.service';
import * as passport from 'passport';

const SYSTEM_GOOGLE = 2;
const GOOGLE_ENABLED = `${process.env.AUTH_GOOGLE_ENABLED}`;
const GOOGLE_CLIENT_ID = `${process.env.AUTH_GOOGLE_CLIENTID}`;
const GOOGLE_CLIENT_SECRET = `${process.env.AUTH_GOOGLE_SECRET}`;
const GOOGLE_CALLBACK_URL = 'http://localhost:3000/auth/google/callback';

@Injectable()
export class GoogleAuthStrategyService extends PassportStrategy(OAuth2Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            clientID: GOOGLE_CLIENT_ID, //secretKey.getGoogleKeys().clientID,
            clientSecret: GOOGLE_CLIENT_SECRET, // secretKey.getGoogleKeys().clientSecret,
            callbackURL: GOOGLE_CALLBACK_URL,
            passReqToCallback: true,
            scope: ['email'], // 'email', 'profile', 'openid'
        });
    }

    async validate(request: any, accessToken, tokenSecret, profile): Promise<any> {
        console.log('github callback with user', request.user, 'profile', profile);
        const user = await this.authService.findUserAuthentication(SYSTEM_GOOGLE, profile.emails[0].value);
        // const user = await this.authService.findUserAuthentication(SYSTEM_GOOGLE, request.user ? request.user.authorityId : profile.id)
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}

// UserDao.find(SYSTEM_GOOGLE, request.user ? request.user.authorityId : profile.id)
