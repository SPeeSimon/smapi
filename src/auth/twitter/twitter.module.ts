import { DynamicModule, Module, forwardRef, Logger } from '@nestjs/common';
import { TwitterAuthStrategyService } from '../twitter/twitter.strategy';
import { AuthModule } from '../auth.module';
import { TwitterController } from './twitter.controller';

@Module({})
export class TwitterModule {
    static registerIfEnabled(enabled: boolean): DynamicModule {
        Logger.log(`Registering Twitter login: ${enabled}`, 'Authentication');
        if (enabled) {
            return {
                module: TwitterModule,
                imports: [AuthModule],
                controllers: [TwitterController],
                providers: [TwitterAuthStrategyService],
                exports: [TwitterAuthStrategyService],
            };
        }
        return {
            module: TwitterModule,
        };
    }
}
