import { DynamicModule, Module, Logger } from '@nestjs/common';
import { AuthModule } from '../auth.module';
import { GitlabController } from './gitlab.controller';
import { GitlabAuthStrategyService } from './gitlab.strategy';

@Module({})
export class GitlabModule {
    static registerIfEnabled(enabled: boolean): DynamicModule {
        Logger.log(`Registering Gitlab login: ${enabled}`, 'Authentication');
        if (enabled) {
            return {
                module: GitlabModule,
                imports: [AuthModule],
                controllers: [GitlabController],
                providers: [GitlabAuthStrategyService],
                exports: [GitlabAuthStrategyService],
            };
        }
        return {
            module: GitlabModule,
        };
    }
}
