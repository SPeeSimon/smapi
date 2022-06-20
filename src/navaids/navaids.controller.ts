import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { FeatureCollection, Point } from 'geojson';
import { Boundary, BoundaryPipe } from 'src/shared/dto/Boundary.dto';
import { toFeatureCollection } from 'src/shared/GeoJsonUtils';
import { NavAidProperties, NavaidsService } from './navaids.service';

@ApiTags('Flightgear')
@Controller('/scenemodels/navaids')
export class NavaidsController {
    constructor(private readonly navaidsService: NavaidsService) {}

    @ApiResponse({ status: 200, isArray: false })
    @Get('/within')
    findWithinBoundary(@Query(BoundaryPipe) boundary: Boundary): Promise<FeatureCollection<Point, NavAidProperties>> {
        return this.navaidsService.findWithinBoundary(boundary).then(toFeatureCollection);
    }
}
