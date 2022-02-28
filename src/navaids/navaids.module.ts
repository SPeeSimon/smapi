import { Module } from '@nestjs/common';
import { NavaidsService } from './navaids.service';
import { NavaidsController } from './navaids.controller';

@Module({
  controllers: [NavaidsController],
  providers: [NavaidsService]
})
export class NavaidsModule {}
