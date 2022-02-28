import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { PositionRequest } from './entities/request.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([PositionRequest])],
  controllers: [RequestsController],
  providers: [RequestsService]
})
export class RequestsModule {}
