import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { AuthService } from '../auth.service';
import { isUrl } from 'src/shared/validations/validations';
import { SYSTEM_GITHUB } from './github.module';


@Injectable()
export class GithubAuthStrategyService extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            clientID: process.env.AUTH_GITHUB_CLIENTID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
            callbackURL: `${process.env.API_URL}/auth/github/callback`,
            passReqToCallback: true,
            scope: ['user:email'], // 'user', 'read:gpg_key', 'read:public_key'
        });
        Logger.log(`Github authentication using clientID ${process.env.AUTH_GITHUB_CLIENTID}`, 'Authentication');
        if (!isUrl(process.env.API_URL)) {
            throw new Error("Env property 'API_URL' used for Github authentication callback is not valid. Set a correct HTTP(s) url value or disable Github authentication.");
        }
    }

    async validate(request: any, accessToken, tokenSecret, profile): Promise<any> {
        const user = await this.authService.validateUser(SYSTEM_GITHUB, profile.emails[0].value);
        // profile.id, profile.displayName, profile.username, profile.profileUrl, profile.provider
        // profile.photos[0].value
        // profile.displayName;
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
