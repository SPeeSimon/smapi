import { isNumber, isString, numberOrDefault, toNumber } from 'src/utils/validations';
import { SearchFGSObjectDto } from './dto/search-object.dto';
import { FGSObject } from './entities/object.entity';
import { Between, SelectQueryBuilder, Like, MoreThanOrEqual, LessThan } from 'typeorm';
import { Position } from 'geojson';
import { isPosition } from 'src/shared/GeoJsonUtils';
import { Model } from 'src/models/entities/model.entity';

const util = require('util');
const DEFAULT_LIMIT = 20;
const OFFSET_START = 0;
const DATE_REGEXP = /[0-9]{4}-[0-1][0-9]-[0-3][0-9]/; // regexp for date formatted: yyyy-mm-dd

export class ObjectSearchQuery {

    constructor(private searchCriteria: Partial<SearchFGSObjectDto>, private queryBuilder: SelectQueryBuilder<FGSObject>) {}

    private addDescription() {
        if (isString(this.searchCriteria.description)) {
            this.queryBuilder.andWhere({ description: Like(`%${this.searchCriteria.description}%`) });
        }
    }

    private addModifedOn() {
        if (this.searchCriteria.modifiedOn !== undefined /*&& DATE_REGEXP.test(this.searchCriteria.modifiedOn)*/) {
            this.queryBuilder.andWhere({ modified: this.searchCriteria.modifiedOn });
        }
    }

    private addModifiedSince() {
        if (this.searchCriteria.modifiedSince !== undefined /*&& DATE_REGEXP.test(this.searchCriteria.modifiedSince)*/) {
            this.queryBuilder.andWhere({ modified: MoreThanOrEqual(this.searchCriteria.modifiedSince) });
        }
    }

    private addModifiedBefore() {
        if (this.searchCriteria.modifiedBefore !== undefined /*&& DATE_REGEXP.test(this.searchCriteria.modifiedBefore)*/) {
            this.queryBuilder.andWhere({ modified: LessThan(this.searchCriteria.modifiedBefore) });
        }
    }

    private addLatitude() {
        if (this.searchCriteria.lat !== undefined && isNumber(this.searchCriteria.lat)) {
            this.queryBuilder.andWhere(`CAST (ST_Y(wkb_geometry) AS text) like :lat}`, { lat: this.searchCriteria.lat + '%' });
            // this.withFilter("Lat", `CAST (ST_Y(wkb_geometry) AS text) like ${this.currentParamIndex()}`, this.searchCriteria.lat + "%");
        }
    }

    private addLongitude() {
        if (this.searchCriteria.lon !== undefined && isNumber(this.searchCriteria.lon)) {
            this.queryBuilder.andWhere(`CAST (ST_X(wkb_geometry) AS text) like :lon}`, { lon: this.searchCriteria.lon + '%' });
            // `CAST (ST_X(wkb_geometry) AS text) like this.searchCriteria.lon + "%");
        }
    }

    private addPoint() {
        if (isPosition(this.searchCriteria.point)) {
            this.queryBuilder.andWhere({ geometry: { type: 'Point', coordinates: this.searchCriteria.point } });
        } else if (typeof this.searchCriteria.point === 'string') {
            const coord = (this.searchCriteria.point as string).match(/[0-9]+[.,][0-9]+/g).map((n) => Number(n));
            if (coord.length == 2) {
                this.queryBuilder.andWhere({ geometry: { type: 'Point', coordinates: coord } });
            }
        }
    }

    private addBoundary() {
        const north = this.searchCriteria.n;
        const east = this.searchCriteria.e;
        const south = this.searchCriteria.s;
        const west = this.searchCriteria.w;
        if (isNumber(north) && isNumber(east) && isNumber(south) && isNumber(west)) {
            this.queryBuilder.andWhere(`ST_Within(wkb_geometry, ST_GeomFromText(:boundary, 4326))`, {
                boundary: util.format(
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
            });
        }
    }

    private addGndElevation() {
        if (this.searchCriteria.elevation !== undefined && isNumber(this.searchCriteria.elevation)) {
            this.queryBuilder.andWhere({
                gndelev: Between(this.searchCriteria.elevation - 25, this.searchCriteria.elevation + 25),
            });
        }
    }

    private addElevOffset() {
        if (this.searchCriteria.elevoffset !== undefined && isNumber(this.searchCriteria.elevoffset)) {
            this.queryBuilder.andWhere({
                elevoffset: Between(this.searchCriteria.elevoffset - 25, this.searchCriteria.elevoffset + 25),
            });
        }
    }

    private addHeading() {
        if (isString(this.searchCriteria.heading)) {
            this.queryBuilder.andWhere({ heading: Between(this.searchCriteria.heading - 5, this.searchCriteria.heading + 5) });
        }
    }

    private addCountry() {
        if (isString(this.searchCriteria.country)) {
            this.queryBuilder.andWhere({ country: this.searchCriteria.country });
        }
    }

    private addModelName() {
        if (isString(this.searchCriteria.modelname)) {
            // this.queryBuilder.andWhere({ model: this.queryBuilder.subQuery().select('model.id').addFrom(Model, 'model').where({modelgroup: this.searchCriteria.modelgroup}) })
            this.queryBuilder.andWhere({ model: { name: Like(`%${this.searchCriteria.modelname}%`) } });
            //   `ob_model in (SELECT mo_id FROM fgs_models WHERE mo_name like `%${this.searchCriteria.name}%`
        }
    }

    private addModelId() {
        if (this.searchCriteria.model !== undefined && isNumber(this.searchCriteria.model)) {
            this.queryBuilder.andWhere({ model: this.searchCriteria.model });
        }
    }

    private addModelgroup() {
        if (this.searchCriteria.modelgroup !== undefined && isNumber(this.searchCriteria.modelgroup)) {
            this.queryBuilder.andWhere({
                model: this.queryBuilder
                    .subQuery()
                    .select('model.id')
                    .addFrom(Model, 'model')
                    .where({ modelgroup: this.searchCriteria.modelgroup }),
            });
            //   `ob_model in (SELECT mo_id FROM fgs_models WHERE mo_shared = Number(this.searchCriteria.modelgroup)
        } else if (typeof this.searchCriteria.modelgroup === 'string') {
            this.queryBuilder.andWhere({
                model: this.queryBuilder
                    .subQuery()
                    .select('model.id')
                    .addFrom(Model, 'model')
                    .where({ modelgroup: { name: this.searchCriteria.modelgroup } }),
            });
        }
    }

    private addObjectgroup() {
        if (this.searchCriteria.objectgroup !== undefined && isNumber(this.searchCriteria.objectgroup)) {
            this.queryBuilder.andWhere({ group: this.searchCriteria.objectgroup });
        } else if (typeof this.searchCriteria.objectgroup === 'string') {
            this.queryBuilder.andWhere({ group: { name: this.searchCriteria.objectgroup } });
        }
    }

    private addTile() {
        if (this.searchCriteria.tile !== undefined && isNumber(this.searchCriteria.tile)) {
            this.queryBuilder.andWhere({ tile: this.searchCriteria.tile });
        }
    }

    private addAuthor() {
        if (isString(this.searchCriteria.author)) {
            this.queryBuilder.andWhere({ submitter: Like(`%${this.searchCriteria.author}%`) });
        }
    }

    private withPaging() {
        this.queryBuilder.limit(numberOrDefault(this.searchCriteria.limit, DEFAULT_LIMIT));
        this.queryBuilder.offset(numberOrDefault(this.searchCriteria.offset, OFFSET_START));
    }

    private withOrder() {
        if (this.searchCriteria.order !== undefined && isNumber(this.searchCriteria.order.column)) {
            const order_cols = {
                1: 'ob_id',
                2: 'ob_text',
                3: 'ob_country',
                4: 'ob_model',
                5: 'ob_modified',
                6: 'ob_shared',
                7: 'ob_tile',
            };

            const order_col = order_cols[toNumber(this.searchCriteria.order.column)] || 'mo_modified';
            const order_dir = this.searchCriteria.order.dir === 'ASC' ? 'ASC' : 'DESC';
            this.queryBuilder.orderBy(order_col, order_dir);
        }
    }

    fillQuery() {
        this.queryBuilder.addSelect(
            "concat('Objects/', fn_SceneDir(wkb_geometry), '/', fn_SceneSubDir(wkb_geometry), '/')",
            'path',
        );
        this.queryBuilder.leftJoinAndSelect('FGSObject.group', 'group');
        this.queryBuilder.leftJoinAndSelect('FGSObject.modified_by', 'modified_by');
        this.queryBuilder.leftJoinAndSelect('FGSObject.model', 'model');
        this.queryBuilder.leftJoinAndSelect('FGSObject.country', 'country');
        this.queryBuilder.where('1=1');
        this.addDescription()
        this.addModifedOn()
        this.addModifiedSince()
        this.addModifiedBefore()
        this.addLatitude()
        this.addLongitude()
        this.addPoint()
        this.addBoundary()
        this.addGndElevation()
        this.addElevOffset()
        this.addHeading()
        this.addCountry()
        this.addModelId()
        this.addModelName()
        this.addModelgroup()
        this.addObjectgroup()
        this.addTile()
        this.addAuthor()
        this.withOrder()        
        this.withPaging()
    }
}
