import { DynamicModule, Module, Logger } from '@nestjs/common';
import { FacebookAuthStrategyService } from './facebook.strategy';
import { FacebookAuthController } from './facebook.controller';
import { AuthModule } from '../auth.module';

@Module({})
export class FacebookModule {
    static registerIfEnabled(enabled: boolean): DynamicModule {
        Logger.log(`Registering Facebook login: ${enabled}`, 'Authentication');
        if (enabled) {
            return {
                module: FacebookModule,
                imports: [AuthModule],
                controllers: [FacebookAuthController],
                providers: [FacebookAuthStrategyService],
                exports: [FacebookAuthStrategyService],
            };
        }
        return {
            module: FacebookModule,
        };
    }
}
