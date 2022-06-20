import { ApiProperty } from '@nestjs/swagger';
import { Boundary } from 'src/shared/dto/Boundary.dto';

export class SearchModelDto extends Boundary {
    @ApiProperty({ description: 'Search for models with the given path', required: false })
    file?: string;
    @ApiProperty({ description: 'Search for models with the given name', required: false })
    name?: string;
    @ApiProperty({ description: 'Search for description of the model', required: false })
    description?: string;
    @ApiProperty({ description: 'Search for models within the given country', required: false })
    country?: string;
    @ApiProperty({ description: 'Search for models that are modified on the given date (exact)', required: false })
    modifiedOn?: Date;
    @ApiProperty({ description: 'Search for models that are modified before the given date (before)', required: false })
    modifiedBefore?: Date;
    @ApiProperty({ description: 'Search for models that are modified after the given date (after)', required: false })
    modifiedSince?: Date;
    @ApiProperty({ description: 'Search for models with the given modelgroup', required: false })
    modelgroup?: number | string;
    @ApiProperty({ description: 'Search for models by a given object id', required: false })
    objectId?: number;
    @ApiProperty({ description: 'Search for models submitted by the given author with name', required: false })
    author?: string;
    @ApiProperty({ description: 'Search for models with or without a thumbnail', required: false })
    thumbnail?: boolean;
    @ApiProperty({ description: 'Search for models submitted by the given author with id', required: false })
    authorId?: number;
    @ApiProperty({ description: 'Limit the result to the given amount', required: false })
    limit?: number;
    @ApiProperty({ description: 'Skip the given number of records (for pagination)', required: false })
    offset?: number;
    @ApiProperty({ description: 'Order the results by the given column (name)', required: false })
    order?: { column: number | string; dir?: 'ASC' | 'DESC' };
}
