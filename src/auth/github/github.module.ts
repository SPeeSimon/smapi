import { DynamicModule, Module, Logger } from '@nestjs/common';
import { GithubAuthStrategyService } from '../github/github.strategy';
import { AuthModule } from '../auth.module';
import { GithubController } from './github.controller';

@Module({})
export class GithubModule {
    static registerIfEnabled(enabled: boolean): DynamicModule {
        Logger.log(`Registering Github login: ${enabled}`, 'Authentication');
        if (enabled) {
            return {
                module: GithubModule,
                imports: [AuthModule],
                controllers: [GithubController],
                providers: [GithubAuthStrategyService],
                exports: [GithubAuthStrategyService],
            };
        }
        return {
            module: GithubModule,
        };
    }
}
