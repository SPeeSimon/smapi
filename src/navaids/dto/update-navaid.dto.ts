import { PartialType } from '@nestjs/swagger';
import { CreateNavaidDto } from './create-navaid.dto';

export class UpdateNavaidDto extends PartialType(CreateNavaidDto) {}
