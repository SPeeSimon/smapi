import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { RequestsController } from './requests.controller';
import { SerializeRequest } from './request-serializer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FGSObject } from 'src/objects/entities/object.entity';
import { PositionRequest } from './entities/request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FGSObject, PositionRequest])],
  controllers: [RequestsController, SubmissionsController],
  providers: [SerializeRequest, SubmissionsService],
})
export class SubmissionsModule {}
