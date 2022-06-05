import { ApiProperty } from "@nestjs/swagger";


export class Boundary {
    @ApiProperty({ description: 'Search for objects within the given boundary (north). For searching for a boundary all 4 corners (north, east, south and west) must be entered.', required: false })
    n?: number;
    @ApiProperty({ description: 'Search for objects within the given boundary (east). For searching for a boundary all 4 corners (north, east, south and west) must be entered.', required: false })
    e?: number;
    @ApiProperty({ description: 'Search for objects within the given boundary (south). For searching for a boundary all 4 corners (north, east, south and west) must be entered.', required: false })
    s?: number;
    @ApiProperty({ description: 'Search for objects within the given boundary (west). For searching for a boundary all 4 corners (north, east, south and west) must be entered.', required: false })
    w?: number;
}