import { DynamicModule, Module, Logger, Controller, UseGuards } from '@nestjs/common';
import { TwitterAuthStrategyService } from '../twitter/twitter.strategy';
import { AuthenticationDetails, AuthModule, NoAuthStrategy } from '../auth.module';
import { AuthGuard } from '@nestjs/passport';
import { AbstractAuthController } from '../abstract.auth.controller';

export const SYSTEM_TWITTER = 4;
export const TWITTER_URL = 'auth/twitter';


@Module({})
export class TwitterModule {
    static registerIfEnabled(enabled: boolean): DynamicModule {
        Logger.log(`Registering Twitter login: ${enabled}`, 'Authentication');
        if (enabled) {
            return {
                module: TwitterModule,
                imports: [AuthModule],
                controllers: [TwitterController],
                providers: [TwitterAuthStrategyService, TwitterAuthenticationDetails],
                exports: [TwitterAuthenticationDetails],
            };
        }
        return {
            module: TwitterModule,
            providers: [
                {
                    provide: TwitterAuthenticationDetails,
                    useValue: NoAuthStrategy,
                }
            ],
            exports: [TwitterAuthenticationDetails],
        };
    }
}

@Controller('auth/twitter')
@UseGuards(AuthGuard('twitter'))
export class TwitterController extends AbstractAuthController {
}

export class TwitterAuthenticationDetails implements AuthenticationDetails {
    get code(): number {
        return SYSTEM_TWITTER;
    }
    get name(): string {
        return 'Twitter';
    }
    get url(): string {
        return TWITTER_URL;
    }
}