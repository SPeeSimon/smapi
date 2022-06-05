import { ApiProperty } from '@nestjs/swagger';
import { Position } from "geojson";
import { Boundary } from 'src/shared/Boundary.dto';

export class SearchFGSObjectDto extends Boundary {
    @ApiProperty({ description: 'Search for description of the object', required: false })
    description?: string;
    @ApiProperty({ description: 'Search for the date of modification date of the object (exact)', required: false })
    modifiedOn?: Date;
    @ApiProperty({ description: 'Search for objects that are modified before the given date (before)', required: false })
    modifiedBefore?: Date;
    @ApiProperty({ description: 'Search for objects that are modified after the given date (after)', required: false })
    modifiedSince?: Date;
    @ApiProperty({ description: 'Search for objects at the given latitude', required: false })
    lat?: number;
    @ApiProperty({ description: 'Search for objects at the given longitude', required: false })
    lon?: number;
    @ApiProperty({ description: 'Search for objects at the given position', example: '1.23,4.56', required: false })
    point?: Position;
    // @ApiProperty({ description: 'Search for objects within the given boundary (north). For searching for a boundary all 4 corners (north, east, south and west) must be entered.', required: false })
    // n?: number;
    // @ApiProperty({ description: 'Search for objects within the given boundary (east). For searching for a boundary all 4 corners (north, east, south and west) must be entered.', required: false })
    // e?: number;
    // @ApiProperty({ description: 'Search for objects within the given boundary (south). For searching for a boundary all 4 corners (north, east, south and west) must be entered.', required: false })
    // s?: number;
    // @ApiProperty({ description: 'Search for objects within the given boundary (west). For searching for a boundary all 4 corners (north, east, south and west) must be entered.', required: false })
    // w?: number;
    @ApiProperty({ description: 'Search for objects with the given elevation', required: false })
    elevation?: number;
    @ApiProperty({ description: 'Search for objects with the given elevation offset', required: false })
    elevoffset?: number;
    @ApiProperty({ description: 'Search for objects with the given heading', required: false })
    heading?: number;
    @ApiProperty({ description: 'Search for objects within the given country', required: false })
    country?: string;
    @ApiProperty({ description: 'Search for objects with the given modelname', required: false })
    modelname?: string;
    @ApiProperty({ description: 'Search for objects with the given mmodel id', required: false })
    model?: number;
    @ApiProperty({ description: 'Search for objects with the given modelgroup', required: false })
    modelgroup?: number|string;
    @ApiProperty({ description: 'Search for objects with the given object group', required: false })
    objectgroup?: number|string;
    @ApiProperty({ description: 'Search for objects placed on the given tile', required: false })
    tile?: number;
    @ApiProperty({ description: 'Search for objects submitted by the given author', required: false })
    author?: string;
    @ApiProperty({ description: 'Limit the result to the given amount', required: false })
    limit?: number;
    @ApiProperty({ description: 'Skip the given number of records (for pagination)', required: false })
    offset?: number;
    @ApiProperty({ description: 'Order the results by the given column (name)', required: false })
    order?: { column: number|string, dir?: 'ASC'|'DESC' };
}
