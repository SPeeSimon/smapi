import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Paging } from 'src/shared/dto/Paging.dto';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Feature, Point } from 'geojson';
import { CreateFGSObjectDto } from './dto/create-object.dto';
import { UpdateObjectDto } from './dto/update-object.dto';
import { FGSObject } from '../dao/entities/object.entity';
import { ObjectSearchQuery } from './ObjectSearchQuery';
import { SearchFGSObjectDto } from './dto/search-object.dto';
import { toObjectFeature } from 'src/shared/GeoJsonUtils';
import { Boundary } from 'src/shared/dto/Boundary.dto';

@Injectable()
export class ObjectsService {
    constructor(@InjectRepository(FGSObject) private objectRepository: Repository<FGSObject>) {}

    create(createObjectDto: CreateFGSObjectDto) {
        const defaultValues = {
            description: createObjectDto.description,
            geometry: { type: 'Point', coordinates: [createObjectDto.longitude, createObjectDto.latitude] },
            gndelev: -9999,
            elevoffset: createObjectDto.obOffset,
            heading: createObjectDto.heading,
            country: { code: createObjectDto.countryCode },
            model: { id: createObjectDto.modelId },
            group: { id: 1 },
            modified: new Date(),
        } as Partial<FGSObject>;
        return this.objectRepository.create(Object.assign({}, defaultValues, createObjectDto));
    }

    findAll(paging: Paging) {
        const options = {
            skip: paging.offset,
            take: paging.limit,
            order: { id: 'DESC' },
            relations: ['group', 'model'],
        } as FindManyOptions;
        return this.objectRepository.find(options);
    }

    findOne(id: number) {
        // concat('Objects/', fn_SceneDir(wkb_geometry), '/', fn_SceneSubDir(wkb_geometry), '/') AS obpath
        const options = {
            relations: ['country', 'group', 'model'],
        } as FindOneOptions;
        return this.objectRepository.findOneOrFail(id, options);
    }

    update(id: number, updateObjectDto: UpdateObjectDto) {
        return this.objectRepository.update(updateObjectDto.id, updateObjectDto);
        //   text: "UPDATE fgs_objects \
        //               SET ob_text=$1, \
        //                 wkb_geometry=ST_PointFromText('POINT($2 $3)', 4326), \
        //                 ob_country=$4, \
        //                 ob_gndelev=-9999, \
        //                 ob_elevoffset=$5, \
        //                 ob_heading=$6, \
        //                 ob_model=$7, \
        //                 ob_group=1 \
        //               WHERE ob_id= $8;",
    }

    remove(id: number) {
        return this.objectRepository.delete(id);
    }
/*

    getObjectFromRow(row): Feature<Point, FGSObject> {
        // $object = new \model\TheObject();
        return {
            type: 'Feature',
            id: row.id,
            geometry: row.geometry,
            properties: row,
            // id: row['ob_id'],
            // title: row['ob_text'],
            // position: {
            //     longitude: row['ob_lon'],
            //     latitude: row['ob_lat'],
            //     groundElevation: row['ob_gndelev'],
            //     elevationOffset: row['ob_elevoffset'],
            //     orientation: row['ob_heading'],
            //     heading: row['ob_heading'],
            // },
            // dir: row['ob_dir'],
            // description: row['ob_text'],
            // groupId: row['ob_group'],
            // lastUpdated: row['ob_modified'],
            // model_id: row['ob_model'],
            // model_name: row['mo_name'],
            // stg: row['obpath'] + row['ob_tile'] + '.stg',
            // country: this.getCountryFromRow(row),
            // objectsgroup: this.getObjectGroupFromRow(row),
        };
    }
*/

    searchObject(searchCriteria: Partial<SearchFGSObjectDto>): Promise<Feature<Point, FGSObject>[]> {
        const queryBuilder = this.objectRepository.createQueryBuilder();
        new ObjectSearchQuery(searchCriteria, queryBuilder).fillQuery();
        return queryBuilder.getMany().then(result => result.map(o => toObjectFeature(o, o.geometry)));
    }

    getObjectsAt(long: number, lat: number): Promise<Feature<Point, FGSObject>[]> {
        return this.searchObject({ point: [long, lat] });
    }

    findWithinBoundary(boundary: Boundary): Promise<Feature<Point, FGSObject>[]> {
        return this.searchObject(boundary);
    }

    getObjectsByModel(modelId: number, paging?: Paging) {
        return this.searchObject({ model: modelId, limit: paging?.limit, offset: paging?.offset });
    }

    countObjects(): Promise<number> {
        return this.objectRepository
            .query('SELECT count(*) AS number FROM fgs_objects')
            .then((result) => result.number as number);
    }

    countObjectsByModel(modelId: number) {
        return this.objectRepository
            .query('SELECT count(*) AS number FROM fgs_objects WHERE ob_model = :id', [modelId])
            .then((result) => result.number as number);
    }


    checkObjectAlreadyExists(object) {
        
        // query = "";
        // if ($objPos.getElevationOffset() == 0) {
        //   query =
        //     "SELECT count(*) AS number \
        //         FROM fgs_objects \
        //         WHERE wkb_geometry = ST_PointFromText($1, 4326) \
        //           AND ob_elevoffset IS NULL \
        //           AND ob_heading = $3\
        //           AND ob_model = $4";
        // } else {
        //   query =
        //     "SELECT count(*) AS number \
        //         FROM fgs_objects \
        //         WHERE wkb_geometry = ST_PointFromText($1, 4326) \
        //           AND ob_elevoffset = $2 \
        //           AND ob_heading = $3\
        //           AND ob_model = $4";
        // }
        // return Query({
        //   name: "ObjectExists",
        //   text: query,
        //   values: [
        //     `POINT(${object.position.getLongitude} ${object.position.getLatitude})`,
        //     object.position.getElevationOffset(),
        //     object.position.getOrientation(),
        //     object.getModelId(),
        //   ],
        // }).then((result) => result.rows[0].number > 0);
    }

    detectNearbyObjects(lat: number, lon: number, modelId: number, dist = 15) {
        return this.objectRepository
            .query('SELECT fn_getnearestobject($1, $2, $3)', [modelId, lon, lat])
            .then((result) => result.number as number);
    }
}
