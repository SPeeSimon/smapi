import { Model } from '../entities/model.entity';

export class CreateModelDto {
    // id;
    path: Model['path'];
    author: Model['author'] | { id }; //.id),
    name: Model['name'];
    notes: Model['notes'];
    thumbfile: Model['thumbfile'];
    modelfile: Model['modelfile'];
    shared: Model['modelgroup'] | { id };

    //     // model.path, Number(model.author.id), model.name, model.notes, model.thumbfile, model.modelfiles.package, Number(model.modelsgroup.id)
    // "INSERT INTO fgs_models (mo_id, mo_path, mo_author, mo_name, mo_notes, mo_thumbfile, mo_modelfile, mo_shared, mo_modified) \
    //                 VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, now()) \
}
