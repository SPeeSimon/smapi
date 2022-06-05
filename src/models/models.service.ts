import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Feature, Point } from 'geojson';
import { Paging } from 'src/shared/Paging.dto';
import { numberOrDefault } from 'src/utils/validations';
import { FindManyOptions, FindOneOptions, ILike, Raw, Repository } from 'typeorm';
import { CreateModelDto } from './dto/create-model.dto';
import { SearchModelDto } from './dto/search-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { Model } from './entities/model.entity';
import { ModelSearchQuery } from './ModelSearchQuery';

export interface FGSModelOptions {
    withModelFile: boolean;
    withThumbnail: boolean;
}

@Injectable()
export class ModelsService {
    constructor(@InjectRepository(Model) private modelRepository: Repository<Model>) {}

    create(createModelDto: CreateModelDto) {
        delete createModelDto['id'];
        const newModel = this.modelRepository.create(createModelDto);
        return this.modelRepository.save(newModel);
        // return Query({
        //   text: "INSERT INTO fgs_models (mo_id, mo_path, mo_author, mo_name, mo_notes, mo_thumbfile, mo_modelfile, mo_shared, mo_modified) \
        //                 VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, now()) \
        //                 RETURNING mo_id",
        //   values: [
        //     model.path, Number(model.author.id), model.name, model.notes, model.thumbfile, model.modelfile, Number(model.shared),
        //     model.path, Number(model.author.id), model.name, model.notes, model.thumbfile, model.modelfiles.package, Number(model.modelsgroup.id)
    }

    findAll(limit: number, offset: number) {
        const options = {
            select: ['id', 'path', 'name', 'notes', 'shared', 'modified'], // , 'mg_id', 'mg_name', 'mg_path', 'au_id', 'au_name', 'au_email', 'au_notes'
            relations: ['author', 'modelgroup'],
            take: limit,
            skip: offset,
        } as FindManyOptions;
        return this.modelRepository.find(options);
    }

    findLatest(limit: number) {
        const options = {
            // select: ['id', 'path', 'name', 'notes', 'shared', 'modified'], // , 'mg_id', 'mg_name', 'mg_path', 'au_id', 'au_name', 'au_email', 'au_notes'
            relations: ['author', 'modelgroup'],
            take: limit,
        } as FindManyOptions;
        return this.modelRepository.find(options);
    }

    findByPath(path: string) {
        const options = {
            select: ['id', 'path', 'name', 'notes', 'modelgroup', 'lastUpdated'], // , 'mg_id', 'mg_name', 'mg_path', 'au_id', 'au_name', 'au_email', 'au_notes'
            // mo_id, mo_path, mo_name, mo_notes, mo_modified, mg_id, mg_name, mg_path, au_id, au_name, au_email, au_notes
            where: { path: path },
            relations: ['author', 'modelgroup'],
        } as FindManyOptions;
        return this.modelRepository.find(options);
    }

    findWithinBoundary(east: number, west: number, north: number, south: number): Promise<Feature<Point, Model>[]> {
        return this.searchModel({ n: north, e: east, s: south, w: west });
    }

    findOne(id: number, selectionOptions: FGSModelOptions) {
        const options = {
            select: ['id', 'path', 'name', 'notes', 'modelgroup', 'lastUpdated']
                .concat(selectionOptions.withModelFile ? ['modelfile'] : [])
                .concat(selectionOptions.withThumbnail ? ['thumbfile'] : []),
            relations: ['author', 'modelgroup'],
        } as FindOneOptions;
        return this.modelRepository.findOneOrFail(id, options).then((result) => {
            delete result.author.email;
            return result;
        });
    }

    update(id: number, updateModelDto: UpdateModelDto) {
        return this.modelRepository.update(id, Object.assign({}, updateModelDto));
    }

    remove(id: number) {
        return `This action removes a #${id} model`; // not present in current site
    }

    searchModel(modelSeachQuery: SearchModelDto) {
        const queryBuilder = this.modelRepository.createQueryBuilder();
        new ModelSearchQuery(modelSeachQuery, queryBuilder).fillQuery();

        Logger.debug('search', modelSeachQuery, queryBuilder.getSql());

        return queryBuilder.getMany().then((result) => result.map((row) => this.getModelFromRow(row)));
    }

    countModel(modelSeachQuery: SearchModelDto) {
        const queryBuilder = this.modelRepository.createQueryBuilder();
        new ModelSearchQuery(modelSeachQuery, queryBuilder).fillQuery();

        console.log('count for', modelSeachQuery, queryBuilder.select('count(*) as total').limit(1).offset(0).getSql());

        return queryBuilder
            .select('count(*) as total')
            .limit(1)
            .offset(0)
            .getRawOne()
            .then((result) => result['total'] as number);
    }

    searchModelMetadata(modelSeachQuery) {
        const query = modelSeachQuery.makeQuery();
        // return Query(query).then((result) => result.rows.map((row) => this.getModelMetadataFromRow(row)));
    }

    searchModelDatatable(searchPattern: string, paging?: Paging) {
        console.log('searchModelDatatable', searchPattern, paging);
        return this.modelRepository.find({
            order: { lastUpdated: 'DESC' },
            where: [{ path: ILike(searchPattern) }, { name: ILike(searchPattern) }, { notes: ILike(searchPattern) }],
            take: numberOrDefault(paging.limit, 20),
            skip: numberOrDefault(paging.offset, 0),
        });
    }

    getModelMetadata(modelId) {
        return this.modelRepository.findOneOrFail(modelId);
    }

    getModelMetadataFromPath(modelPath) {
        return this.searchModel({ file: modelPath }).then((result) => {
            if (0 == result.length) {
                throw new Error(`Model ${modelPath} not found!`);
            }
            return result;
        });
    }

    getModelMetadataFromSTGName(modelName: string) {
        const tabPath = modelName.split('/'); // Explodes the fields of the string separated by /
        const queriedModelPath = tabPath[tabPath.length - 1]; // Returns the last field value.
        return this.getModelMetadataFromPath(queriedModelPath);
    }

    getModelsMetadata(limit: number, offset: number) {
        return this.searchModel({ limit: limit, offset: offset });
        //   return result.rows.map(row => this.getModelMetadataFromRow(row));
    }

    countTotalModels() {
        return this.countModel({});
    }

    countModelsNoThumb() {
        return this.countModel({ thumbnail: false });
    }

    getModelFromRow(row) {
        // $model = new \model\Model();
        delete row.author?.email;
        delete row.modified_by?.email;
        return row;
        // return {
        //   metadata: this.getModelMetadataFromRow(row),
        //   modelFiles: row["mo_modelfile"],
        //   thumbnail: row["mo_thumbfile"],
        // };
    }
    /*    
    
      getModelMetadataFromRow(row) {
        // $author = new \model\Author();
        // $modelMetadata = new \model\ModelMetadata();
        return {
          id: Number(row["mo_id"]),
          author: {
            id: Number(row["au_id"]),
            name: row["au_name"],
            email: row["au_email"],
            description: row["au_notes"],
          },
          filename: row["mo_path"],
          name: row["mo_name"],
          description: row["mo_notes"],
          modelsGroup: this.getModelsGroupFromRow(row),
          lastUpdated: row["mo_modified"],
        };
      }
*/
    getPaths() {
        return this.modelRepository
            .createQueryBuilder()
            .select('mo_id', 'id')
            .addSelect('mo_path', 'path')
            .orderBy({ path: 'ASC' })
            .getRawMany();
    }

    // type ModelWithModelFile = Pick<Model, "path" | "modelfile" | "lastUpdated">;

    async getModelFiles(modelId: number) {
        return this.modelRepository.findOneOrFail(modelId, {
            select: ['path', 'modelfile', 'lastUpdated'],
            where: { modelfile: Raw((alias) => `${alias} is not null`) },
        });
    }

    getThumbnail(modelId: number) {
        return this.modelRepository.findOneOrFail(modelId, {
            select: ['path', 'thumbfile', 'lastUpdated'],
            where: { modelfile: Raw((alias) => `${alias} is not null`) },
        });
    }
}
