import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FeatureCollection, Point } from 'geojson';
import { NavAidProperties, NavaidsService } from './navaids.service';

@ApiTags('fligthgear')
@Controller('/scenemodels/navaids')
export class NavaidsController {
    constructor(private readonly navaidsService: NavaidsService) {}

    @ApiQuery({ name: 'e', required: true, description: 'coordinate of position east' })
    @ApiQuery({ name: 'w', required: true, description: 'coordinate of position west' })
    @ApiQuery({ name: 'n', required: true, description: 'coordinate of position north' })
    @ApiQuery({ name: 's', required: true, description: 'coordinate of position south' })
    @ApiResponse({ status: 200, isArray: false })
    @Get('/within')
    findWithinBoundary(
        @Query('e') east: number,
        @Query('w') west: number,
        @Query('n') north: number,
        @Query('s') south: number,
    ): Promise<FeatureCollection<Point, NavAidProperties>> {
        return this.navaidsService.findWithinBoundary(east, west, north, south).then((result) => {
            return {
                type: 'FeatureCollection',
                features: result,
            };
        });
    }
}
