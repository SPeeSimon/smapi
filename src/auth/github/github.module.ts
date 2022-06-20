import { DynamicModule, Module, Logger, Controller, UseGuards } from '@nestjs/common';
import { GithubAuthStrategyService } from '../github/github.strategy';
import { AuthenticationDetails, AuthModule, NoAuthStrategy } from '../auth.module';
import { AuthGuard } from '@nestjs/passport';
import { AbstractAuthController } from '../abstract.auth.controller';

export const SYSTEM_GITHUB = 1;
export const GITHUB_URL = '/auth/github';

@Module({})
export class GithubModule {
    static registerIfEnabled(enabled: boolean): DynamicModule {
        Logger.log(`Registering Github login: ${enabled}`, 'Authentication');
        if (enabled) {
            return {
                module: GithubModule,
                imports: [AuthModule],
                controllers: [GithubController],
                providers: [GithubAuthStrategyService, GithubAuthenticationDetails],
                exports: [GithubAuthenticationDetails],
            };
        }
        return {
            module: GithubModule,
            providers: [
                {
                    provide: GithubAuthenticationDetails,
                    useValue: NoAuthStrategy,
                }
            ],
            exports: [GithubAuthenticationDetails],
        };
    }
}

@Controller('/auth/github')
@UseGuards(AuthGuard('github'))
class GithubController extends AbstractAuthController {
}

export class GithubAuthenticationDetails implements AuthenticationDetails {
    get code(): number {
        return SYSTEM_GITHUB;
    }
    get name(): string {
        return 'Github';
    }
    get url(): string {
        return GITHUB_URL;
    }
}