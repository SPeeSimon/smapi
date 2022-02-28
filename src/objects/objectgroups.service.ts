import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectGroup } from 'src/modelgroups/entities/group.entity';

@Injectable()
export class ObjectGroupsService {
    constructor(@InjectRepository(ObjectGroup) private objectGroupRepository: Repository<ObjectGroup>) {}

    findOne(objectGroupId: number) {
        return this.objectGroupRepository.findOneOrFail(objectGroupId);
    }

    findAll() {
        return this.objectGroupRepository.find({ order: {name: 'ASC'}});
    }
}
