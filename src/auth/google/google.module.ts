import { DynamicModule, Module, Logger } from '@nestjs/common';
import { GoogleAuthStrategyService } from './google.strategy';
import { AuthModule } from '../auth.module';
import { GoogleController } from './google.controller';

@Module({})
export class GoogleModule {
    static registerIfEnabled(enabled: boolean): DynamicModule {
        Logger.log(`Registering Google login: ${enabled}`, 'Authentication');
        if (enabled) {
            return {
                module: GoogleModule,
                imports: [AuthModule],
                controllers: [GoogleController],
                providers: [GoogleAuthStrategyService],
                exports: [GoogleAuthStrategyService],
            };
        }
        return {
            module: GoogleModule,
        };
    }
}
