import { Point } from 'geojson';
import { AuthorsService } from 'src/authors/authors.service';
import { Author } from 'src/authors/entities/author.entity';
import { ObjectGroup } from 'src/modelgroups/entities/group.entity';
import { Modelgroup } from 'src/modelgroups/entities/modelgroup.entity';
import { Model } from 'src/models/entities/model.entity';
import { ModelsService } from 'src/models/models.service';
import { Country } from 'src/navaids/entities/country.entity';
import { FGSObject } from 'src/objects/entities/object.entity';
import { ObjectsService } from 'src/objects/objects.service';
import { Zipped64 } from 'src/utils/Zipped64';


class ObjectFactory {
    constructor(private objectDao) {}
    createObject(
        arg0: number,
        arg1: any,
        arg2: any,
        arg3: any,
        arg4: any,
        arg5: any,
        arg6: any,
        arg7: number,
        arg8: any,
    ): FGSObject {
        throw new Error('Method not implemented.');
    }
}

class ModelFactory {
    constructor(private modelDao, private authorDao) {}
    createModelMetadata(arg0: number, arg1: any, arg2: any, arg3: any, arg4: any, arg5: any): Model {
        throw new Error('Method not implemented.');
    }
}

class RequestError {
    constructor(id, hash, message) {}
}


class FGSMutatieRequest<C> {
    email: string;
    comment: string;
    content: C;
    type: string;

    setContributorEmail(arg0: string) {
        throw new Error('Method not implemented.');
    }
    setComment(arg0: string) {
        throw new Error('Method not implemented.');
    }

}


class ObjectUpdate {
    description: string;
    longitude: number;
    latitude: number;
    offset?: number;
    orientation: number;
    country: string;
    modelId: number;
    objectId: number;
}

class RequestObjectUpdate extends FGSMutatieRequest<ObjectUpdate> {
    type = 'OBJECT_UPDATE';
    newObject: Partial<FGSObject>;
    oldObject: FGSObject;

    setNewObject(newObject: Partial<FGSObject>) {
        this.newObject = newObject;
    }

    setOldObject(existingObject: FGSObject) {
        this.oldObject = existingObject;
    }

    static isType(value: any): value is RequestObjectUpdate {
        return 'type' in value && 'OBJECT_UPDATE' === value.type;
    }
}

class RequestObjectDelete extends FGSMutatieRequest<{objId: number}> {
    type = 'OBJECT_DELETE';
    content: {objId: number};

    setObjectToDelete(objectToDel: number) {
        this.content.objId = objectToDel;
    }

    static isType(value: any): value is RequestObjectDelete {
        return 'type' in value && 'OBJECT_DELETE' === value.type;
    }

}

class RequestMassiveObjectsAdd extends FGSMutatieRequest<any[]> {
    type = 'OBJECTS_ADD';
    content: [
        // FGSObject
        // {
        //     description, longitude, latitude, offset, orientation, country, modelId
        // },
    ];

    setNewObjects($newObjects: any) {
        throw new Error('Method not implemented.');
    }

    static isType(value: any): value is RequestMassiveObjectsAdd {
        return 'type' in value && 'OBJECTS_ADD' === value.type;
    }

}

class RequestModelAdd extends FGSMutatieRequest<{model: Model, object: FGSObject, author?: Author,}> {
    type = 'MODEL_ADD';
    content: {
        model: Model,
        object: FGSObject,
        author?: Author,
    };

    // model: {filename, author, name, description(notes), thumbnail, modelfiles, modelgroup}
    // object: {description, longitude, latitude, offset, orientation, country, modelId}
    // author?: {name, email}

    setNewAuthor(newAuthor: Author) {
        this.content.author = newAuthor;
    }
    setNewModel(newModel: Model) {
        this.content.model = newModel;
    }
    setNewObject(newObject: FGSObject) {
        this.content.object = newObject;
    }

    static isType(value: any): value is RequestModelAdd {
        return 'type' in value && 'MODEL_ADD' === value.type;
    }

}

class RequestModelUpdate extends FGSMutatieRequest<any> {
    type = 'MODEL_UPDATE';
    objId: number;
    content: {
        // filename, author(id), name, description, thumbnail, modelfiles, modelgroup, modelid
    };

    setNewModel($newModel: any) {
        throw new Error('Method not implemented.');
    }
    setOldModel($oldModel: any) {
        throw new Error('Method not implemented.');
    }

    static isType(value: any): value is RequestModelUpdate {
        return 'type' in value && 'MODEL_UPDATE' === value.type;
    }

}

export class SerializeRequest {
    modelDao: ModelsService;
    authorDao: AuthorsService;
    objectDao: ObjectsService;

    public serializeRequest(request: FGSMutatieRequest<any>) {
        var type, reqContentArray;

        if (RequestObjectUpdate.isType(request)) {
            type = request.type;
            reqContentArray = this.arrayRequestObjectUpdate(request);
        } else if (RequestObjectDelete.isType(request)) {
            type = request.type;
            reqContentArray = this.arrayRequestObjectDelete(request);
        } else if (RequestMassiveObjectsAdd.isType(request)) {
            type = request.type;
            reqContentArray = this.arrayRequestMassiveObjectsAdd(request);
        } else if (RequestModelAdd.isType(request)) {
            type = request.type;
            reqContentArray = this.arrayRequestModelAdd(request);
        } else if (RequestModelUpdate.isType(request)) {
            type = request.type;
            reqContentArray = this.arrayRequestModelUpdate(request);
        } else {
            throw new Error('Not a request!');
        }

        return {
            type: type,
            email: request.email,
            comment: request.comment,
            content: reqContentArray,
        };
    }

    private arrayObject(object) {
        const objPos = object.getPosition();
        const offset = objPos.getElevationOffset();

        return {
            description: object.getDescription(),
            longitude: objPos.getLongitude(),
            latitude: objPos.getLatitude(),
            offset: offset ? 'NULL' : offset,
            orientation: objPos.getOrientation(),
            country: object.getCountry().getCode(),
            modelId: object.getModelId(),
        };
    }

    private arrayRequestObjectUpdate(request) {
        const newObj = request.getNewObject();
        const newObjPos = newObj.getPosition();
        const offset = newObjPos.getElevationOffset();

        return {
            description: newObj.getDescription(),
            longitude: newObjPos.getLongitude(),
            latitude: newObjPos.getLatitude(),
            offset: offset ? 'NULL' : offset,
            orientation: newObjPos.getOrientation(),
            country: newObj.getCountry().getCode(),
            modelId: newObj.getModelId(),
            objectId: newObj.getId(),
        };
    }

    private arrayRequestObjectDelete(request) {
        const objToDel = request.getObjectToDelete();
        return { objId: objToDel.getId() };
    }

    private arrayRequestMassiveObjectsAdd(request) {
        return request.getNewObjects().map((newObj) => this.arrayObject(newObj));
    }

    private arrayRequestModelAdd(request) {
        const newModel = request.getNewModel();
        const newModelMD = newModel.getMetadata();
        const newObject = request.getNewObject();
        const newAuthor = request.getNewAuthor();

        const moArray = {
            filename: newModelMD.getFilename(),
            author: newModelMD.getAuthor().getId(),
            name: newModelMD.getName(),
            description: newModelMD.getDescription(),
            thumbnail: newModel.getThumbnail(),
            modelfiles: newModel.getModelFiles(),
            modelgroup: newModelMD.getModelsGroup().getId(),
        };

        // object
        const obArray = this.arrayObject(newObject);

        // possible new author
        if (newAuthor != null) {
            const authorArray = { name: newModelMD.getAuthor().getName(), email: newModelMD.getAuthor().getEmail() };
            return { model: moArray, object: obArray, author: authorArray };
        }
        return { model: moArray, object: obArray };
    }

    private arrayRequestModelUpdate(request) {
        const newModel = request.getNewModel();
        const newModelMD = newModel.getMetadata();

        return {
            filename: newModelMD.getFilename(),
            author: newModelMD.getAuthor().getId(),
            name: newModelMD.getName(),
            description: newModelMD.getDescription(),
            thumbnail: newModel.getThumbnail(),
            modelfiles: newModel.getModelFiles(),
            modelgroup: newModelMD.getModelsGroup().getId(),
            modelid: newModelMD.getId(),
        };
    }


    public getRequestFromRow(requestRow) : RequestModelAdd | RequestModelUpdate | RequestMassiveObjectsAdd | RequestObjectDelete | RequestObjectUpdate {
        // Decoding in Base64. Dezipping the Base64'd request.
        const requestArray = Zipped64.decodeJSON(requestRow.base64_sqlz);
        const requestType = requestArray['type'];
        const requestContentArray = requestArray['content'];
        var request;

        // Delete object request
        if (RequestObjectDelete.isType(requestArray)) {
            request = this.getRequestObjectDeleteFromRow(requestContentArray);
        }

        // Update object request
        if (RequestObjectUpdate.isType(requestArray)) {
            request = this.getRequestObjectUpdateFromRow(requestContentArray);
        }

        // Add objects request
        if (RequestMassiveObjectsAdd.isType(requestArray)) {
            request = this.getRequestMassiveObjectsAddFromRow(requestContentArray);
        }

        // Add model request
        if (RequestModelAdd.isType(requestArray)) {
            request = this.getRequestModelAddFromRow(requestContentArray);
        }

        // Update model request
        if (RequestModelUpdate.isType(requestArray)) {
            request = this.getRequestModelUpdateFromRow(requestContentArray);
        }

        if (request) {
            request.setId(requestRow['spr_id']);
            request.setSig(requestRow['spr_hash']);
            request.setComment(requestArray['comment']);
            request.setContributorEmail(requestArray['email']);

            return request;
        } else {
            throw new Error('Error reading request: ');
        }
    }

    private getRequestModelAddFromRow(reqArr) {
        const modelArr = reqArr['model'];
        const objArr = reqArr['object'];

        const modelFactory = new ModelFactory(this.modelDao, this.authorDao);
        const modelMD = modelFactory.createModelMetadata(
            -1,
            modelArr['author'],
            modelArr['filename'],
            modelArr['name'],
            modelArr['description'],
            modelArr['modelgroup'],
        );
        const newModel = new Model();
        // newModel.setMetadata(modelMD);
        // newModel.setModelFiles(new ModelFilesTar(base64_decode(modelArr['modelfiles'])));
        // newModel.setThumbnail(base64_decode(modelArr['thumbnail']));

        // Retrieve OBJECT data from query
        const newObject = this.getObjectFromRow(objArr);
        const requestModelAdd = new RequestModelAdd();

        // Retrieve new author if exists
        if (reqArr['author'] || 'author' in reqArr) {
            const authorArr = reqArr['author'];
            const newAuthor = new Author();
            newAuthor.id = modelArr['author'];
            newAuthor.name = authorArr['name'];
            newAuthor.email = authorArr['email'];

            requestModelAdd.setNewAuthor(newAuthor);
            newModel.author = newAuthor;
        }

        requestModelAdd.setNewModel(newModel);
        requestModelAdd.setNewObject(newObject);

        return requestModelAdd;
    }

    private getRequestModelUpdateFromRow(modelArr) {
        // Retrieve data from query
        const modelFactory = new ModelFactory(this.modelDao, this.authorDao);
        const modelMD = modelFactory.createModelMetadata(
            modelArr['modelid'],
            modelArr['author'],
            modelArr['filename'],
            modelArr['name'],
            modelArr['description'],
            modelArr['modelgroup'],
        );

        const newModel = new Model();
        // newModel.setMetadata(modelMD);
        // newModel.setModelFiles(new \ModelFilesTar(base64_decode(modelArr['modelfiles'])));
        // newModel.setThumbnail(base64_decode(modelArr['thumbnail']));

        // Retrieve old model
        const oldModel = this.modelDao.findOne(modelMD.id, {withModelFile: true, withThumbnail: true});

        const requestModelUpd = new RequestModelUpdate();
        requestModelUpd.setNewModel(newModel);
        requestModelUpd.setOldModel(oldModel);

        return requestModelUpd;
    }

    private getObjectFromRow(addReqArray) {
        const objectFactory = new ObjectFactory(this.objectDao);

        return objectFactory.createObject(
            -1,
            addReqArray['modelId'],
            addReqArray['longitude'],
            addReqArray['latitude'],
            addReqArray['country'],
            addReqArray['offset'],
            addReqArray['orientation'],
            1,
            addReqArray['description'],
        );
    }

    private getRequestMassiveObjectsAddFromRow(objRequests) {
        const newObjects = objRequests.map((objRequest) => this.getObjectFromRow(objRequest));

        const requestMassObjAdd = new RequestMassiveObjectsAdd();
        requestMassObjAdd.setNewObjects(newObjects);

        return requestMassObjAdd;
    }

    private async getRequestObjectUpdateFromRow(updReqArray) {
        const newObject = {
            id: updReqArray.objectId,
            model: {id: updReqArray.modelId},
            geometry: {type: 'Point', coordinates: [updReqArray.longitude, updReqArray.latitude]} as Point,
            country: {code: updReqArray.country} as Country,
            gndelev: -9999,
            elevoffset: updReqArray.offset,
            heading: updReqArray.orientation,
            description: updReqArray.description,
            group: {id: 1} as ObjectGroup,
        }

        const requestObjUp = new RequestObjectUpdate();
        requestObjUp.setContributorEmail('');
        requestObjUp.setComment('');
        requestObjUp.setNewObject(newObject as Partial<FGSObject>);
        requestObjUp.setOldObject(await this.objectDao.findOne(updReqArray.objectId));

        return requestObjUp;
    }

    private async getRequestObjectDeleteFromRow(delRequestArray) {
        const objectToDel = await this.objectDao.findOne(delRequestArray['objId']);
        const requestObjDel = new RequestObjectDelete();

        // Not available with actual DAO
        requestObjDel.setContributorEmail('');
        requestObjDel.setComment('');
        requestObjDel.setObjectToDelete(objectToDel.id);
        return requestObjDel;
    }
}
