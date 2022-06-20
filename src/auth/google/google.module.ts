import { DynamicModule, Module, Logger, Controller, UseGuards } from '@nestjs/common';
import { GoogleAuthStrategyService } from './google.strategy';
import { AuthenticationDetails, AuthModule, NoAuthStrategy } from '../auth.module';
import { AuthGuard } from '@nestjs/passport';
import { AbstractAuthController } from '../abstract.auth.controller';

export const SYSTEM_GOOGLE = 2;
export const GOOGLE_URL = 'auth/google';

@Module({})
export class GoogleModule {
    static registerIfEnabled(enabled: boolean): DynamicModule {
        Logger.log(`Registering Google login: ${enabled}`, 'Authentication');
        if (enabled) {
            return {
                module: GoogleModule,
                imports: [AuthModule],
                controllers: [GoogleController],
                providers: [GoogleAuthStrategyService, GoogleAuthenticationDetails],
                exports: [GoogleAuthenticationDetails],
            };
        }
        return {
            module: GoogleModule,
            providers: [
                {
                    provide: GoogleAuthenticationDetails,
                    useValue: NoAuthStrategy,
                }
            ],
            exports: [GoogleAuthenticationDetails],
        };
    }
}

@Controller('auth/google')
@UseGuards(AuthGuard('google'))
export class GoogleController extends AbstractAuthController {
}

export class GoogleAuthenticationDetails implements AuthenticationDetails {
    get code(): number {
        return SYSTEM_GOOGLE;
    }
    get name(): string {
        return 'Google';
    }
    get url(): string {
        return GOOGLE_URL;
    }
}