import { DynamicModule, Module, Logger, Controller, UseGuards } from '@nestjs/common';
import { FacebookAuthStrategyService } from './facebook.strategy';
import { AuthenticationDetails, AuthModule, NoAuthStrategy } from '../auth.module';
import { AuthGuard } from '@nestjs/passport';
import { AbstractAuthController } from '../abstract.auth.controller';

export const SYSTEM_FACEBOOK = 3;
export const FACEBOOK_URL = 'auth/facebook';

@Module({})
export class FacebookModule {
    static registerIfEnabled(enabled: boolean): DynamicModule {
        Logger.log(`Registering Facebook login: ${enabled}`, 'Authentication');
        if (enabled) {
            return {
                module: FacebookModule,
                imports: [AuthModule],
                controllers: [FacebookAuthController],
                providers: [FacebookAuthStrategyService, FacebookAuthenticationDetails],
                exports: [FacebookAuthenticationDetails],
            };
        }
        return {
            module: FacebookModule,
            providers: [
                {
                    provide: FacebookAuthenticationDetails,
                    useValue: NoAuthStrategy,
                }
            ],
            exports: [FacebookAuthenticationDetails],
        };
    }
}

@Controller('auth/facebook')
@UseGuards(AuthGuard('facebook'))
export class FacebookAuthController extends AbstractAuthController {

}

export class FacebookAuthenticationDetails implements AuthenticationDetails {
    get code(): number {
        return SYSTEM_FACEBOOK;
    }
    get name(): string {
        return 'Facebook';
    }
    get url(): string {
        return FACEBOOK_URL;
    }
}