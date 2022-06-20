import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class Boundary {
    @ApiProperty({
        name: 'n',
        description:
            'Coordinate of the boundary, position north. For searching for a boundary all 4 corners (north, east, south and west) must be entered.',
    })
    north?: number;
    @ApiProperty({
        name: 'e',
        description:
            'Coordinate of the boundary, position east. For searching for a boundary all 4 corners (north, east, south and west) must be entered.',
    })
    east?: number;
    @ApiProperty({
        name: 's',
        description:
            'Coordinate of the boundary, position south. For searching for a boundary all 4 corners (north, east, south and west) must be entered.',
    })
    south?: number;
    @ApiProperty({
        name: 'w',
        description:
            'Coordinate of the boundary, position west. For searching for a boundary all 4 corners (north, east, south and west) must be entered.',
    })
    west?: number;
}

@Injectable()
export class BoundaryPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        return {
            north: value['north'] || value['n'],
            east:  value['east']  || value['e'],
            south: value['south'] || value['s'],
            west:  value['west']  || value['s'],
        };
    }
}
