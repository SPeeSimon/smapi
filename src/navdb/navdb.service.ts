import { Injectable, NotFoundException } from '@nestjs/common';
import { getConnection } from 'typeorm';

@Injectable()
export class NavdbService {
    findAirport(icao: string) {
        return getConnection()
            .query(`select icao, ST_AsGeoJSON(wkb_geometry) as runways from apt_runway where icao=UPPER($1)`, [icao])
            .then((result) => {
                if (result == null || result.length == 0) {
                    throw new NotFoundException();
                }
                return result.map((row) => JSON.parse(row.runways));
            });
    }
}
