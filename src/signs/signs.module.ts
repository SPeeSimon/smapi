import { Module } from '@nestjs/common';
import { SignsService } from './signs.service';
import { SignsController } from './signs.controller';

@Module({
  controllers: [SignsController],
  providers: [SignsService]
})
export class SignsModule {}
