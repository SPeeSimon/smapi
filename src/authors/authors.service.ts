import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Paging } from 'src/shared/Paging.dto';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author } from './entities/author.entity';

@Injectable()
export class AuthorsService {
    constructor(@InjectRepository(Author) private authorRepository: Repository<Author>) {}

    create(createAuthorDto: CreateAuthorDto) {
        return this.authorRepository.create(Object.assign({}, createAuthorDto, { id: null }));
    }

    findAll(paging: Paging) {
        const options = {
            skip: paging.offset,
            take: paging.limit,
        } as FindManyOptions;
        return this.authorRepository.find(options);
    }

    findByEmail(email: string) {
        const options = {
            where: { email: email },
        } as FindManyOptions;
        return this.authorRepository.find(options);
    }

    findOne(id: number) {
        /*
"select au_id, au_name, au_notes, coalesce(models_for_author, 0) as count \
                from fgs_authors \
                left join (\
                  select mo_author, count(mo_id) models_for_author \
                  from fgs_models \
                  group by mo_author\
                ) model_count on au_id=mo_author \
                where au_id = $1"
        */
        return this.authorRepository.findOneOrFail(id);
    }

    update(id: number, updateAuthorDto: UpdateAuthorDto) {
        return `This action updates a #${id} author`;
    }

    remove(id: number) {
        return `This action removes a #${id} author`;
    }
}
