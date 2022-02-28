import { Injectable } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, FindManyOptions, Raw, Repository } from 'typeorm';
import { PositionRequest } from './entities/request.entity';

const os = require('os');
const crypto = require('crypto');
const zlib = require('zlib');

const HOSTNAME = os.hostname();
const HOST_RANDOM = crypto.randomBytes(16).toString();

@Injectable()
export class RequestsService {
    constructor(@InjectRepository(PositionRequest) private positionRequestRepository: Repository<PositionRequest>) {}

    create(createRequestDto: CreateRequestDto) {
        return 'This action adds a new request';
    }

    findAll() {
        return this.positionRequestRepository
            .find({
                order: { id: 'ASC' },
            })
            .then((result) => {
                return result.map((r) => {
                    try {
                        return { result: 'ok', id: r.id, hash: r.hash, data: this.getRequestFromRow(r) };
                    } catch (error) {
                        return { result: 'failed', id: r.id, hash: r.hash, data: error };
                    }
                });
            });
    }

    update(id: number, updateRequestDto: UpdateRequestDto) {
        return `This action updates a #${id} request`;
    }

    remove(id: number) {
        return `This action removes a #${id} request`;
    }

    findOne(id) {
        return this.positionRequestRepository.findOneOrFail(id);
        // text: 'SELECT spr_id, spr_hash, spr_base64_sqlz \
        //     return getRequestFromRow(result);
    }

    getRequestFromSig(sig) {
        return this.positionRequestRepository.findOneOrFail({
            where: { spr_hash: sig },
        });
        // return getRequestFromRow(result);
    }

    saveRequest(request) {
        const reqStr = this.serializeRequest(request);
        const zippedQuery = zlib.gzipSync(reqStr, {level: 8});
        const encodedReqStr = Buffer.from(zippedQuery).toString('base64');
        const shaToCompute = `<${new Date().getTime()}><${HOSTNAME}><${request.host}><${
            request.remoteAddress
        }><${HOST_RANDOM}><${encodedReqStr}>`;
        const sig = crypto.createHash('sha256').update(shaToCompute, 'utf8').digest();

        return this.positionRequestRepository.save({
            hash: sig,
            base64_sqlz: encodedReqStr,
        });
        // return Query({
        //     name: 'Insert PositionRequests',
        //     text: 'INSERT INTO fgs_position_requests (spr_id, spr_hash, spr_base64_sqlz) VALUES (DEFAULT, $1, $2) RETURNING spr_id;',
        //     values: [sig, encodedReqStr],
        // }).then((result) => {
        //     if (result.rowCount === 0) {
        //         throw new Error(`Adding request failed!`);
        //     }
        //     request.id = result.rows[0].spr_id;
        //     request.sig = sig;
        //     return request;
        // });
    }

    deleteRequest(sig) {
        const options = {
            where: { hash: sig },
        } as FindConditions<PositionRequest>;
        return this.positionRequestRepository.delete(options);
    }

    serializeRequest(request) {
    //     let type = null;
    //     let reqContentArray = null;

    //     switch (get_class(request)) {
    //         case 'modelRequestObjectUpdate':
    //             $type = 'OBJECT_UPDATE';
    //             reqContentArray = arrayRequestObjectUpdate(request);
    //             break;

    //         case 'modelRequestObjectDelete':
    //             $type = 'OBJECT_DELETE';
    //             reqContentArray = arrayRequestObjectDelete(request);
    //             break;

    //         case 'modelRequestMassiveObjectsAdd':
    //             $type = 'OBJECTS_ADD';
    //             reqContentArray = arrayRequestMassiveObjectsAdd(request);
    //             break;

    //         case 'modelRequestModelAdd':
    //             $type = 'MODEL_ADD';
    //             reqContentArray = arrayRequestModelAdd(request);
    //             break;

    //         case 'modelRequestModelUpdate':
    //             $type = 'MODEL_UPDATE';
    //             reqContentArray = arrayRequestModelUpdate(request);
    //             break;

    //         default:
    //             throw new Error('Not a request!');
    //     }

        // return { type: type, email: request.getContributorEmail(), comment: request.getComment(), content: reqContentArray };
        return { type: 'MODEL_UPDATE', email: request.getContributorEmail(), comment: request.getComment(), content: [] };
    }

    // arrayObject($object) {
    //     $objPos = $object.getPosition();
    //     $offset = $objPos.getElevationOffset();

    //     return {
    //         description: $object.getDescription(),
    //         longitude: $objPos.getLongitude(),
    //         latitude: $objPos.getLatitude(),
    //         offset: empty($offset) ? 'NULL' : $offset,
    //         orientation: $objPos.getOrientation(),
    //         country: $object.getCountry().getCode(),
    //         modelId: $object.getModelId(),
    //     };
    // }

    // arrayRequestObjectUpdate($request) {
    //     $newObj = $request.getNewObject();
    //     $newObjPos = $newObj.getPosition();
    //     $offset = $newObjPos.getElevationOffset();

    //     return {
    //         description: $newObj.getDescription(),
    //         longitude: $newObjPos.getLongitude(),
    //         latitude: $newObjPos.getLatitude(),
    //         offset: empty($offset) ? 'NULL' : $offset,
    //         orientation: $newObjPos.getOrientation(),
    //         country: $newObj.getCountry().getCode(),
    //         modelId: $newObj.getModelId(),
    //         objectId: $newObj.getId(),
    //     };
    // }

    // arrayRequestObjectDelete($request) {
    //     $objToDel = $request.getObjectToDelete();

    //     return { objId: $objToDel.getId() };
    // }

    // arrayRequestMassiveObjectsAdd($request) {
    //     $newObjects = $request.getNewObjects();

    //     // Proceed on with the request generation
    //     return $newObjects.map(arrayObject); // For each line, add the data content to the request
    // }

    // arrayRequestModelAdd($request) {
    //     $newModel = $request.getNewModel();
    //     $newModelMD = $newModel.getMetadata();
    //     $newObject = $request.getNewObject();
    //     $newAuthor = $request.getNewAuthor();

    //     $moArray = {
    //         filename: $newModelMD.getFilename(),
    //         author: $newModelMD.getAuthor().getId(),
    //         name: $newModelMD.getName(),
    //         description: $newModelMD.getDescription(),
    //         thumbnail: $newModel.getThumbnail(),
    //         modelfiles: $newModel.getModelFiles(),
    //         modelgroup: $newModelMD.getModelsGroup().getId(),
    //     };

    //     // object
    //     $obArray = arrayObject($newObject);

    //     // possible new author
    //     if ($newAuthor != null) {
    //         $authorArray = { name: $newModelMD.getAuthor().getName(), email: $newModelMD.getAuthor().getEmail() };

    //         return { model: $moArray, object: $obArray, author: $authorArray };
    //     }

    //     return { model: $moArray, object: $obArray };
    // }

    // arrayRequestModelUpdate($request) {
    //     $newModel = $request.getNewModel();
    //     $newModelMD = $newModel.getMetadata();

    //     return {
    //         filename: $newModelMD.getFilename(),
    //         author: $newModelMD.getAuthor().getId(),
    //         name: $newModelMD.getName(),
    //         description: $newModelMD.getDescription(),
    //         thumbnail: $newModel.getThumbnail(),
    //         modelfiles: $newModel.getModelFiles(),
    //         modelgroup: $newModelMD.getModelsGroup().getId(),
    //         modelid: $newModelMD.getId(),
    //     };
    // }

    getRequestFromRow(row) {
    //     // Decoding in Base64. Dezipping the Base64'd request.
    //     requestJson = gzuncompress(base64_decode(row['spr_base64_sqlz']));

    //     let request = null;
    //     requestArray = json_decode(requestJson, true);
    //     requestType = requestArray['type'];
    //     requestContentArray = requestArray['content'];

    //     // Delete object request
    //     if (requestType == 'OBJECT_DELETE') {
    //         request = getRequestObjectDeleteFromRow(requestContentArray);
    //     }

    //     // Update object request
    //     if (requestType == 'OBJECT_UPDATE') {
    //         request = getRequestObjectUpdateFromRow(requestContentArray);
    //     }

    //     // Add objects request
    //     if (requestType == 'OBJECTS_ADD') {
    //         request = getRequestMassiveObjectsAddFromRow(requestContentArray);
    //     }

    //     // Add model request
    //     if (requestType == 'MODEL_ADD') {
    //         request = getRequestModelAddFromRow(requestContentArray);
    //     }

    //     // Update model request
    //     if (requestType == 'MODEL_UPDATE') {
    //         request = getRequestModelUpdateFromRow(requestContentArray);
    //     }

    //     if (isset(request)) {
    //         request.setId(row['spr_id']);
    //         request.setSig(row['spr_hash']);
    //         request.setComment(requestArray['comment']);
    //         request.setContributorEmail(requestArray['email']);

    //         return request;
    //     } else {
    //         throw new Error('Error reading request: '.requestQuery);
    //     }
    }

    // getRequestModelAddFromRow($reqArr) {
    //     $modelArr = $reqArr['model'];
    //     $objArr = $reqArr['object'];

    //     $modelFactory = {}; //new \ModelFactory(modelDao, authorDao);
    //     $modelMD = $modelFactory.createModelMetadata(
    //         -1,
    //         $modelArr['author'],
    //         $modelArr['filename'],
    //         $modelArr['name'],
    //         $modelArr['description'],
    //         $modelArr['modelgroup'],
    //     );
    //     $newModel = {
    //         metadata: $modelMD,
    //         modelFiles: {}, //new \ModelFilesTar(base64_decode($modelArr['modelfiles'])),
    //         thumbnail: base64_decode($modelArr['thumbnail']),
    //     }; //new \model\Model();

    //     // Retrieve OBJECT data from query
    //     $newObject = getObjectFromRow($objArr);

    //     $requestModelAdd = {}; //new \model\RequestModelAdd();

    //     // Retrieve new author if exists
    //     if (isset($reqArr['author']) || array_key_exists('author', $reqArr)) {
    //         $authorArr = $reqArr['author'];
    //         $newAuthor = {
    //             id: $modelArr['author'],
    //             name: $authorArr['name'],
    //             email: $authorArr['email'],
    //         }; //new \model\Author();

    //         $requestModelAdd.newAuthor = $newAuthor;
    //         $newModel.metadata.author = $newAuthor;
    //     }

    //     $requestModelAdd.setNewModel($newModel);
    //     $requestModelAdd.setNewObject($newObject);

    //     return $requestModelAdd;
    // }

    // getRequestModelUpdateFromRow($modelArr) {
    //     // Retrieve data from query
    //     $modelFactory = {}; // new \ModelFactory(modelDao, authorDao);
    //     $modelMD = $modelFactory.createModelMetadata(
    //         $modelArr['modelid'],
    //         $modelArr['author'],
    //         $modelArr['filename'],
    //         $modelArr['name'],
    //         $modelArr['description'],
    //         $modelArr['modelgroup'],
    //     );

    //     $newModel = {
    //         metadata: $modelMD,
    //         modelFiles: {}, //new \ModelFilesTar(base64_decode($modelArr['modelfiles'])),
    //         thumbnail: base64_decode($modelArr['thumbnail']),
    //     }; // new \model\Model();

    //     // Retrieve old model
    //     $oldModel = modelDao.getModel($modelMD.getId());
    //     $requestModelUpd = {
    //         newModel: $newModel,
    //         oldModel: $oldModel,
    //     }; // new \model\RequestModelUpdate();

    //     return $requestModelUpd;
    // }

    // getObjectFromRow($addReqArray) {
    //     $objectFactory = {}; // new \ObjectFactory(objectDao);

    //     return $objectFactory.createObject(
    //         -1,
    //         $addReqArray['modelId'],
    //         $addReqArray['longitude'],
    //         $addReqArray['latitude'],
    //         $addReqArray['country'],
    //         $addReqArray['offset'],
    //         $addReqArray['orientation'],
    //         1,
    //         $addReqArray['description'],
    //     );
    // }

    // getRequestMassiveObjectsAddFromRow($objRequests) {
    //     $newObjects = $objRequests.map(($objRequest) => {
    //         return getObjectFromRow($objRequest);
    //     });

    //     $requestMassObjAdd = {}; // new \model\RequestMassiveObjectsAdd();
    //     $requestMassObjAdd.setNewObjects($newObjects);

    //     return $requestMassObjAdd;
    // }

    // getRequestObjectUpdateFromRow($updReqArray) {
    //     $objectFactory = {}; // new \ObjectFactory(objectDao);
    //     $newObject = $objectFactory.createObject(
    //         $updReqArray['objectId'],
    //         $updReqArray['modelId'],
    //         $updReqArray['longitude'],
    //         $updReqArray['latitude'],
    //         $updReqArray['country'],
    //         $updReqArray['offset'],
    //         $updReqArray['orientation'],
    //         1,
    //         $updReqArray['description'],
    //     );

    //     $requestObjUp = {
    //         contributorEmail: '',
    //         comment: '',
    //         newObject: $newObject,
    //         oldObject: objectDao.getObject($updReqArray['objectId']),
    //     }; // new \model\RequestObjectUpdate();

    //     return $requestObjUp;
    // }

    // getRequestObjectDeleteFromRow($delRequestArray) {
    //     $objectToDel = new ObjectDAO().getObject($delRequestArray['objId']);
    //     return {
    //         contributorEmail: '',
    //         comment: '',
    //         objectToDelete: $objectToDel,
    //     }; // new \model\RequestObjectDelete();.

    //     // Not available with actual DAO
    // }
}
