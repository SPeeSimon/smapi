import { isNumber, isString, numberOrDefault, toNumber } from 'src/shared/validations/validations';
import { SearchModelDto } from './dto/search-model.dto';
import { Model } from '../dao/entities/model.entity';
import { Brackets, IsNull, SelectQueryBuilder, Like, MoreThanOrEqual, LessThan } from 'typeorm';
import { FGSObject } from 'src/dao/entities/object.entity';
import { Author } from 'src/dao/entities/author.entity';
const util = require('util');

const DEFAULT_LIMIT = 20;
const OFFSET_START = 0;

export class ModelSearchQuery {
    constructor(private searchCriteria: Partial<SearchModelDto>, private queryBuilder: SelectQueryBuilder<Model>) {}

    forFile() {
        if (isString(this.searchCriteria.file)) {
            this.queryBuilder.andWhere({ path: Like(`%${this.searchCriteria.file}%`) });
        }
    }

    forName() {
        if (isString(this.searchCriteria.name)) {
            this.queryBuilder.andWhere({ name: Like(`%${this.searchCriteria.name}%`) });
        }
    }

    forDescription() {
        if (isString(this.searchCriteria.description)) {
            this.queryBuilder.andWhere({ description: Like(`%${this.searchCriteria.description}%`) });
        }
    }

    forCountry() {
        if (isString(this.searchCriteria.country)) {
            this.queryBuilder
                .andWhere(
                    (qb) =>
                        'mo_id in ' +
                        qb
                            .subQuery()
                            .select('obj.ob_model')
                            .addFrom(FGSObject, 'obj')
                            .where('obj.ob_country = :country')
                            .getQuery(),
                )
                .setParameter('country', this.searchCriteria.country);
        }
    }

    forModifedOn() {
        if (this.searchCriteria.modifiedOn !== undefined /*&& DATE_REGEXP.test(this.searchCriteria.modifiedOn)*/) {
            this.queryBuilder.andWhere({ modified: this.searchCriteria.modifiedOn });
            // this.withFilter("MO", `date_trunc('DAY', mo_modified) = $${this.currentParamIndex()}`, this.searchCriteria.modifiedOn);
        }
    }

    forModifiedSince() {
        if (this.searchCriteria.modifiedSince !== undefined /*&& DATE_REGEXP.test(this.searchCriteria.modified)*/) {
            this.queryBuilder.andWhere({ modified: MoreThanOrEqual(this.searchCriteria.modifiedOn) });
        }
    }

    forModifiedBefore() {
        if (this.searchCriteria.modifiedBefore !== undefined /*&& DATE_REGEXP.test(modified)*/) {
            this.queryBuilder.andWhere({ modified: LessThan(this.searchCriteria.modifiedBefore) });
        }
    }

    forModelgroup() {
        if (this.searchCriteria.modelgroup !== undefined && isNumber(this.searchCriteria.modelgroup)) {
            this.queryBuilder.andWhere({ modelgroup: this.searchCriteria.modelgroup });
        } else if (typeof this.searchCriteria.modelgroup === 'string') {
            this.queryBuilder.andWhere({ modelgroup: { name: this.searchCriteria.modelgroup } });
        }
    }

    forObjectId() {
        if (this.searchCriteria.objectId !== undefined && isNumber(this.searchCriteria.objectId)) {
            this.queryBuilder
                .andWhere(
                    (qb) =>
                        'mo_id in ' +
                        qb.subQuery().select('obj.ob_model').addFrom(FGSObject, 'obj').where('obj.ob_id = :objectid').getQuery(),
                )
                .setParameter('objectid', this.searchCriteria.objectId);
        }
    }

    forAuthor() {
        if (isString(this.searchCriteria.author)) {
            this.queryBuilder
                .andWhere(
                    new Brackets((qb) => {
                        qb.where(
                            (qb2) =>
                                'mo_author in ' +
                                qb2
                                    .subQuery()
                                    .select('ma.au_id')
                                    .addFrom(Author, 'ma')
                                    .where('ma.au_name like :authorName')
                                    .getQuery(),
                        ).orWhere(
                            (qb2) =>
                                'mo_modified_by in ' +
                                qb2
                                    .subQuery()
                                    .select('mm.au_id')
                                    .addFrom(Author, 'mm')
                                    .where('mm.au_name like :authorName')
                                    .getQuery(),
                        );
                    }),
                )
                .setParameter('authorName', `%${this.searchCriteria.author}%`);
        }
    }

    forAuthorId() {
        if (isNumber(this.searchCriteria.authorId)) {
            this.queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where({ author: this.searchCriteria.authorId }).orWhere({ modified_by: this.searchCriteria.authorId });
                }),
            );
        }
    }

    forThumbnail() {
        if (this.searchCriteria.thumbnail === undefined) {
            // nothing
        } else if (this.searchCriteria.thumbnail === true || (this.searchCriteria.thumbnail as unknown) === 'true') {
            this.queryBuilder.andWhere('mo_thumbfile IS NOT NULL');
        } else if (this.searchCriteria.thumbnail === false || (this.searchCriteria.thumbnail as unknown) === 'false') {
            this.queryBuilder.andWhere({ thumbfile: IsNull() });
        }
    }

    private addBoundary() {
        const north = this.searchCriteria.north;
        const east = this.searchCriteria.east;
        const south = this.searchCriteria.south;
        const west = this.searchCriteria.west;
        if (isNumber(north) && isNumber(east) && isNumber(south) && isNumber(west)) {
            this.queryBuilder
                .andWhere(
                    (qb) =>
                        'mo_id in ' +
                        qb
                            .subQuery()
                            .select('obj.ob_model')
                            .addFrom(FGSObject, 'obj')
                            .where('ST_Within(obj.wkb_geometry, ST_GeomFromText(:boundary, 4326))')
                            .getQuery(),
                )
                .setParameter('boundary', 
                     util.format(
                        'POLYGON((%d %d,%d %d,%d %d,%d %d,%d %d))',
                        Number(west),
                        Number(south),
                        Number(west),
                        Number(north),
                        Number(east),
                        Number(north),
                        Number(east),
                        Number(south),
                        Number(west),
                        Number(south),
                    ),
                );
        }
    }

    private withPaging() {
        this.queryBuilder.limit(numberOrDefault(this.searchCriteria.limit, DEFAULT_LIMIT));
        this.queryBuilder.offset(numberOrDefault(this.searchCriteria.offset, OFFSET_START));
    }

    withOrder() {
        if (this.searchCriteria.order !== undefined && isNumber(this.searchCriteria.order.column)) {
            const order_cols = {
                1: 'mo_id',
                2: 'mo_name',
                3: 'mo_path',
                4: 'mo_notes',
                5: 'mo_modified',
                6: 'mo_shared',
            };
            const order_col = order_cols[toNumber(this.searchCriteria.order.column)] || 'mo_modified';
            const order_dir = this.searchCriteria.order.dir === 'ASC' ? 'ASC' : 'DESC';
            this.queryBuilder.orderBy(order_col, order_dir);
        }
    }

    fillQuery() {
        this.queryBuilder.leftJoinAndSelect('Model.modelgroup', 'modelgroup');
        this.queryBuilder.leftJoinAndSelect('Model.modified_by', 'modified_by');
        this.queryBuilder.leftJoinAndSelect('Model.author', 'author');
        this.queryBuilder.where('1=1');
        this.forFile();
        this.forName();
        this.forDescription();
        this.forCountry();
        this.addBoundary();
        this.forModifedOn();
        this.forModifiedSince();
        this.forModifiedBefore();
        this.forModelgroup();
        this.forObjectId();
        this.forAuthor();
        this.forAuthorId();
        this.forThumbnail();
        this.withPaging();
        this.withOrder();
    }
}
