import { Module } from '@nestjs/common';
import { ModelsService } from './models.service';
import { ModelsController } from './models.controller';
import { Model } from '../dao/entities/model.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjectsModule } from 'src/objects/objects.module';

@Module({
  imports: [TypeOrmModule.forFeature([Model]), ObjectsModule,],
  controllers: [ModelsController],
  providers: [ModelsService],
  exports: [ModelsService],
})
export class ModelsModule {}
