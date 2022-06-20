import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-twitter';
import { AuthService } from '../auth.service';
import { isUrl } from 'src/shared/validations/validations';
import { SYSTEM_TWITTER } from './twitter.module';


@Injectable()
export class TwitterAuthStrategyService extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            consumerKey: process.env.AUTH_TWITTER_KEY,
            consumerSecret: process.env.AUTH_TWITTER_SECRET,
            callbackURL: `${process.env.API_URL}/auth/twitter/callback`,
            passReqToCallback: true,
            scope: ["profile", "email"],
        });
        Logger.log(`Twitter authentication using consumerKey ${process.env.AUTH_TWITTER_KEY}`, 'Authentication');
        if (!isUrl(process.env.API_URL)) {
            throw new Error("Env property 'API_URL' used for Twitter authentication callback is not valid. Set a correct HTTP(s) url value or disable Twitter authentication.");
        }
    }


    async validate(request: any, accessToken, tokenSecret, profile): Promise<any> {
        const user = await this.authService.validateUser(SYSTEM_TWITTER, profile.emails[0].value);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
