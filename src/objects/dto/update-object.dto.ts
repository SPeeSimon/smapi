import { PartialType } from '@nestjs/swagger';
import { CreateFGSObjectDto } from './create-object.dto';

export class UpdateObjectDto extends PartialType(CreateFGSObjectDto) {
    id: number;
        //                 ob_country=$4, \
        //                 ob_gndelev=-9999, \
        //                 ob_elevoffset=$5, \
        //                 ob_heading=$6, \
        //                 ob_model=$7, \
        //                 ob_group=1 \
        //               WHERE ob_id= $8;
}
