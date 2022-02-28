import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-twitter';
import { AuthService } from '../auth.service';
import * as passport from 'passport';

const SYSTEM_TWITTER = 4;
const TWITTER_ENABLED = `${process.env.AUTH_TWITTER_ENABLED}`;
const TWITTER_CONSUMER_KEY = `${process.env.AUTH_TWITTER_KEY}`;
const TWITTER_CONSUMER_SECRET = `${process.env.AUTH_TWITTER_SECRET}`;
const TWITTER_CALLBACK_URL = 'auth/twitter/callback';

@Injectable()
export class TwitterAuthStrategyService extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            consumerKey: TWITTER_CONSUMER_KEY,
            consumerSecret: TWITTER_CONSUMER_SECRET,
            callbackURL: TWITTER_CALLBACK_URL, //getCallbackUrl(TWITTER_CALLBACK_URL),
            passReqToCallback: true,
            scope: ["profile", "email"],
        });
    }

    async validate(request: any, accessToken, tokenSecret, profile): Promise<any> {
        const user = await this.authService.validateUser(SYSTEM_TWITTER, profile.emails[0].value);
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
              "twitter.id": profile.id,
            };

        UserDao.find(SYSTEM_TWITTER, username)
*/