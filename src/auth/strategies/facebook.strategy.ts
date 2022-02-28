import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { AuthService } from '../auth.service';
import * as passport from 'passport';

const SYSTEM_FACEBOOK = 3;
const FACEBOOK_ENABLED = `${process.env.AUTH_FACEBOOK_ENABLED}`;
const FACEBOOK_CLIENT_ID = `${process.env.AUTH_FACEBOOK_CLIENTID}`;
const FACEBOOK_CLIENT_SECRET = `${process.env.AUTH_FACEBOOK_SECRET}`;
const FACEBOOK_CALLBACK_URL = 'http://localhost:3000/auth/facebook/callback';

@Injectable()
export class FacebookAuthStrategyService extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            clientID: FACEBOOK_CLIENT_ID,
            clientSecret: FACEBOOK_CLIENT_SECRET,
            callbackURL: FACEBOOK_CALLBACK_URL,
            passReqToCallback: true,
            profileFields: ['id', 'displayName', 'email'], // 'photos', 'profile
        });
    }

    async validate(request: any, accessToken, tokenSecret, profile): Promise<any> {
        const user = await this.authService.validateUser(SYSTEM_FACEBOOK, profile.emails[0].value);
        // const user = await this.authService.validateUser(username, password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}

/*
        var filter = request.user
          ? {
              _id: request.user._id,
            }
          : {
              "facebook.id": profile.id,
            };

        UserDao.find(SYSTEM_FACEBOOK, username)
*/
