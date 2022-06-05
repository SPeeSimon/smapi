import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FeatureCollection, Point } from 'geojson';
import { SignProperties, SignsService } from './signs.service';

@ApiTags('Fligthgear')
@Controller('/scenemodels/signs')
export class SignsController {
    constructor(private readonly signsService: SignsService) {}

    @ApiQuery({ name: 'e', required: true, description: 'coordinate of position east' })
    @ApiQuery({ name: 'w', required: true, description: 'coordinate of position west' })
    @ApiQuery({ name: 'n', required: true, description: 'coordinate of position north' })
    @ApiQuery({ name: 's', required: true, description: 'coordinate of position south' })
    @ApiResponse({ status: 200, isArray: false })
    @Get(['/', '/within'])
    findWithinBoundary(
        @Query('e') east: number,
        @Query('w') west: number,
        @Query('n') north: number,
        @Query('s') south: number,
    ): Promise<FeatureCollection<Point, SignProperties>> {
        return this.signsService.findWithinBoundary(east, west, north, south).then((result) => {
            return {
                type: 'FeatureCollection',
                features: result,
            };
        });
    }
}
