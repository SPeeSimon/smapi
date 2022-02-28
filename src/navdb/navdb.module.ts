import { Module } from '@nestjs/common';
import { NavdbService } from './navdb.service';
import { NavdbController } from './navdb.controller';

@Module({
  controllers: [NavdbController],
  providers: [NavdbService]
})
export class NavdbModule {}
