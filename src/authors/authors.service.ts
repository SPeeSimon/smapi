import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'src/models/entities/model.entity';
import { Paging } from 'src/shared/Paging.dto';
import { numberOrDefault } from 'src/utils/validations';
import { FindManyOptions, Repository, EntityNotFoundError } from 'typeorm';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author } from './entities/author.entity';

@Injectable()
export class AuthorsService {
    constructor(@InjectRepository(Author) private authorRepository: Repository<Author>) {}

    create(createAuthorDto: CreateAuthorDto) {
        const author = this.authorRepository.create(Object.assign({}, createAuthorDto, { id: null }));
        return this.authorRepository.save(author);
    }

    private mapRawToAuthor(raw) {
        return {
            id: raw['author_au_id'],
            name: raw['author_au_name'],
            email: raw['author_au_email'],
            description: raw['author_au_notes'],
            modelCount: numberOrDefault(raw['author_modelCount'], 0),
        } as Author;
    }

    private countModelsPerAuthorSubQuery(queryBuilder) {
        return queryBuilder
            .subQuery()
            .select('mo_author')
            .addSelect('count(mo_id)', 'model_count')
            .from(Model, 'models')
            .groupBy('models.mo_author');
    }

    findAll(paging: Paging) {
        return this.authorRepository
            .createQueryBuilder('author')
            .orderBy('author.id')
            .skip(paging.offset)
            .limit(paging.limit)
            .leftJoinAndMapOne(
                'modelCount',
                this.countModelsPerAuthorSubQuery,
                'model_count',
                'model_count.mo_author = author.id',
            )
            .addSelect('model_count.model_count', 'author_modelCount1')
            .getRawMany()
            .then((result) => result.map((r) => this.mapRawToAuthor(r)));
    }

    findByEmail(email: string) {
        return this.authorRepository
            .createQueryBuilder('author')
            .where({ email: email })
            .leftJoinAndMapOne(
                'modelCount',
                this.countModelsPerAuthorSubQuery,
                'model_count',
                'model_count.mo_author = author.id',
            )
            .addSelect('model_count.model_count', 'author_modelCount')
            .getRawMany()
            .then((result) => result.map((r) => this.mapRawToAuthor(r)));
    }

    findOne(id: number) {
        return this.authorRepository
            .createQueryBuilder('author')
            .where({ id: id })
            .leftJoinAndMapOne(
                'modelCount',
                this.countModelsPerAuthorSubQuery,
                'model_count',
                'model_count.mo_author = author.id',
            )
            .addSelect('model_count.model_count', 'author_modelCount2')
            .getRawOne()
            .then((r) => {
                if (r == undefined) {
                    throw new EntityNotFoundError(Author, { id: id });
                }
                return this.mapRawToAuthor(r);
            });
    }

    update(id: number, updateAuthorDto: UpdateAuthorDto) {
        return this.authorRepository.update(id, updateAuthorDto);
    }

}
