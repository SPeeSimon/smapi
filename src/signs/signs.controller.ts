import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { FeatureCollection, Point } from 'geojson';
import { Boundary, BoundaryPipe } from 'src/shared/dto/Boundary.dto';
import { toFeatureCollection } from 'src/shared/GeoJsonUtils';
import { SignProperties, SignsService } from './signs.service';

@ApiTags('Flightgear')
@Controller('/scenemodels/signs')
export class SignsController {
    constructor(private readonly signsService: SignsService) {}

    @ApiResponse({ status: 200, isArray: false })
    @Get(['/', '/within'])
    findWithinBoundary(@Query(BoundaryPipe) boundary: Boundary): Promise<FeatureCollection<Point, SignProperties>> {
        return this.signsService.findWithinBoundary(boundary).then(toFeatureCollection);
    }

}
