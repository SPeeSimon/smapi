import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

const SYSTEM_BASIC = 99;

@Injectable()
export class LocalAuthStrategyService extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super();
    }

    async validate(username: string, password: string): Promise<any> {
        const user = await this.authService.validateUser(SYSTEM_BASIC, username);
        console.log('authenticated', username, 'to', user);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
