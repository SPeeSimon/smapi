import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-gitlab2';
import { AuthService } from '../auth.service';
import { isUrl } from 'src/utils/validations';
import * as passport from 'passport';

const SYSTEM_GITLAB = 5;

@Injectable()
export class GitlabAuthStrategyService extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            clientID: process.env.AUTH_GITLAB_CLIENTID,
            clientSecret: process.env.AUTH_GITLAB_SECRET,
            callbackURL: `${process.env.API_URL}/auth/gitlab/callback`,
            passReqToCallback: true,
            scope: ['email'], // 'profile', 'read_user', 'openid'
        });
        Logger.log(`Gitlab authentication using clientID ${process.env.AUTH_GITLAB_CLIENTID}`, 'Authentication');
        if (!isUrl(process.env.API_URL)) {
            throw new Error("Env property 'API_URL' used for Gitlab authentication callback is not valid. Set a correct HTTP(s) url value or disable Gitlab authentication.");
        }
    }

    async validate(request: any, accessToken, tokenSecret, profile): Promise<any> {
        const user = await this.authService.validateUser(SYSTEM_GITLAB, profile.emails[0].value);
        // profile.photos[0].value
        // profile.displayName;
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
