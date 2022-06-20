import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'src/dao/entities/model.entity';
import { Paging } from 'src/shared/dto/Paging.dto';
import { numberOrDefault } from 'src/shared/validations/validations';
import { Repository, EntityNotFoundError } from 'typeorm';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author } from '../dao/entities/author.entity';

@Injectable()
export class AuthorsService {
    constructor(@InjectRepository(Author) private authorRepository: Repository<Author>) {}

    create(createAuthorDto: CreateAuthorDto) {
        const author = this.authorRepository.create(Object.assign({}, createAuthorDto, { id: null }));
        return this.authorRepository.save(author);
    }

    private mapRawRowsToAuthor(rawResult: unknown[]): Author[] {
        return rawResult.map(this.mapRawToAuthor);
    }

    private mapRawToAuthor(raw: unknown): Author {
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

    private withModelCount(queryBuilder) {
        return queryBuilder
            .leftJoinAndMapOne(
                'modelCount',
                this.countModelsPerAuthorSubQuery,
                'model_count',
                'model_count.mo_author = author.id',
            )
            .addSelect('model_count.model_count', 'author_modelCount');
    }

    findAll(paging: Paging) {
        return this.withModelCount(this.authorRepository.createQueryBuilder('author'))
            .orderBy('author.id')
            .offset(paging.offset)
            .limit(paging.limit)
            .getRawMany()
            .then(r => this.mapRawRowsToAuthor(r));
    }

    findByEmail(email: string) {
        return this.withModelCount(this.authorRepository.createQueryBuilder('author').where({ email: email }))
            .getRawMany()
            .then(r => this.mapRawRowsToAuthor(r));
    }

    findOne(id: number) {
        return this.withModelCount(this.authorRepository.createQueryBuilder('author').where({ id: id }))
            .getRawOne()
            .then((r) => {
                if (r == undefined || r == null) {
                    throw new EntityNotFoundError(Author, { id: id });
                }
                return this.mapRawToAuthor(r);
            });
    }

    update(id: number, updateAuthorDto: UpdateAuthorDto) {
        return this.authorRepository.update(id, updateAuthorDto);
    }

    removeEmail(author: Partial<Author> | Author) {
        delete author.email;
        return author;
    }
}
