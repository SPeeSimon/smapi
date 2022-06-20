import { DynamicModule, Module, Logger, Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AbstractAuthController } from '../abstract.auth.controller';
import { AuthenticationDetails, AuthModule, NoAuthStrategy } from '../auth.module';
import { GitlabAuthStrategyService } from './gitlab.strategy';

export const SYSTEM_GITLAB = 5;
export const GITLAB_URL = 'auth/gitlab';

@Module({})
export class GitlabModule {
    static registerIfEnabled(enabled: boolean): DynamicModule {
        Logger.log(`Registering Gitlab login: ${enabled}`, 'Authentication');
        if (enabled) {
            return {
                module: GitlabModule,
                imports: [AuthModule],
                controllers: [GitlabController],
                providers: [GitlabAuthStrategyService, GitlabAuthenticationDetails],
                exports: [GitlabAuthenticationDetails],
            };
        }
        return {
            module: GitlabModule,
            providers: [
                {
                    provide: GitlabAuthenticationDetails,
                    useValue: NoAuthStrategy,
                }
            ],
            exports: [GitlabAuthenticationDetails],
        };
    }
}

@Controller('auth/gitlab')
@UseGuards(AuthGuard('gitlab'))
export class GitlabController extends AbstractAuthController {
}


export class GitlabAuthenticationDetails implements AuthenticationDetails {
    get code(): number {
        return SYSTEM_GITLAB;
    }
    get name(): string {
        return 'Gitlab';
    }
    get url(): string {
        return GITLAB_URL;
    }
}