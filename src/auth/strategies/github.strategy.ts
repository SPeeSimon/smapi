import * as passport from 'passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { AuthService } from '../auth.service';

const SYSTEM_GITHUB = 1;
const GITHUB_ENABLED = `${process.env.AUTH_GITHUB_ENABLED}`;
const GITHUB_CLIENT_ID = `${process.env.AUTH_GITHUB_CLIENTID}`;
const GITHUB_CLIENT_SECRET = `${process.env.AUTH_GITHUB_SECRET}`;
const GITHUB_CALLBACK_URL = `${process.env.URL}/auth/github/callback`;

@Injectable()
export class GithubAuthStrategyService extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            clientID: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
            callbackURL: GITHUB_CALLBACK_URL,
            passReqToCallback: true,
            scope: ['user:email'], // 'user', 'read:gpg_key', 'read:public_key'
        });
    }

    async validate(request: any, accessToken, tokenSecret, profile): Promise<any> {
        const user = await this.authService.validateUser(SYSTEM_GITHUB, profile.emails[0].value);
        // profile.photos[0].value
        // profile.displayName;
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
