import { Controller, Get, Param } from '@nestjs/common';
import { ApiParam, ApiOkResponse, ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';
import { GeometryCollection } from 'geojson';
import { NavdbService } from './navdb.service';

interface FgAirportRunways {
    runwaysGeometry: GeometryCollection;
    procedures: [];
}

@ApiTags('fligthgear')
@Controller('navdb')
export class NavdbController {
    constructor(private readonly navdbService: NavdbService) {}

    @ApiOkResponse({ isArray: false, description: 'A response with the runway geometries' })
    @ApiNotFoundResponse({ isArray: false, description: 'An error response when the code is not found' })
    @ApiParam({
        name: 'icao',
        description:
            'Airport code, as from the International Civil Aviation Organization (https://en.wikipedia.org/wiki/International_Civil_Aviation_Organization#Airport_codes)',
    })
    @Get('/airport/:icao')
    findAirportByCode(@Param('icao') icao: string): Promise<FgAirportRunways> {
        return this.navdbService.findAirport(icao).then((result) => {
            return {
                runwaysGeometry: {
                    type: 'GeometryCollection',
                    geometries: result,
                },
                procedures: [],
            };
        });
    }
}
