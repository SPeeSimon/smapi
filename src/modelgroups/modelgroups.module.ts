import { Module } from '@nestjs/common';
import { ModelgroupsService } from './modelgroups.service';
import { ModelgroupsController } from './modelgroups.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Modelgroup } from './entities/modelgroup.entity';
import { ObjectGroup } from './entities/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Modelgroup, ObjectGroup])],
  controllers: [ModelgroupsController],
  providers: [ModelgroupsService],
})
export class ModelgroupsModule {}
