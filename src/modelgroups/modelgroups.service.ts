import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Modelgroup } from '../dao/entities/modelgroup.entity';

@Injectable()
export class ModelgroupsService {
    constructor(@InjectRepository(Modelgroup) private modelgroupRepository: Repository<Modelgroup>) {}

    findAll() {
        const options = { order: { name: 'ASC' } } as FindManyOptions;
        return this.modelgroupRepository.find(options);
    }

    findOne(id: number) {
        return this.modelgroupRepository.findOneOrFail(id);
    }

    findByPath(path: string) {
        const options = { order: { name: 'ASC' }, where: [{ path: path }] } as FindManyOptions;
        return this.modelgroupRepository.find(options);
    }

}
