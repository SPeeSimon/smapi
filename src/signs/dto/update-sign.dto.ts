import { PartialType } from '@nestjs/swagger';
import { CreateSignDto } from './create-sign.dto';

export class UpdateSignDto extends PartialType(CreateSignDto) {}
