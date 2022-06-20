import { Module } from '@nestjs/common';
import { ObjectsService } from './objects.service';
import { ObjectsController } from './objects.controller';
import { FGSObject } from '../dao/entities/object.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjectGroupsService } from './objectgroups.service';
import { CountriesService } from './countries.service';
import { ObjectGroup } from 'src/dao/entities/group.entity';
import { Country } from 'src/dao/entities/country.entity';

@Module({
    imports: [TypeOrmModule.forFeature([FGSObject, ObjectGroup, Country])],
    controllers: [ObjectsController],
    providers: [ObjectsService, ObjectGroupsService, CountriesService],
    exports: [ObjectsService],
})
export class ObjectsModule {}
