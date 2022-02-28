import { PartialType } from '@nestjs/swagger';
import { CreateModelDto } from './create-model.dto';

export class UpdateModelDto extends PartialType(CreateModelDto) {
//     mo_path = '".pg_escape_string($modelMD->getFilename())."', ".
//     "mo_author = ".pg_escape_string($modelMD->getAuthor()->getId()).", ".
//     "mo_name = '".pg_escape_string($modelMD->getName())."', ".
//     "mo_notes = '".pg_escape_string($modelMD->getDescription())."', ".
//     "mo_thumbfile = '".base64_encode($model->getThumbnail())."', ".
//     "mo_modelfile = '".base64_encode($model->getModelFiles()->getPackage())."', ".
//     "mo_shared = ".pg_escape_string($modelMD->getModelsGroup()->getId());
// $query .= " WHERE mo_id = ".$modelMD->getId();

}
