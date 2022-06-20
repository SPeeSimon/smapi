import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { Point, Feature } from 'geojson';
import { Boundary } from 'src/shared/dto/Boundary.dto';
const util = require('util');

export interface NavAidProperties {
    id: string;
    type: string;
    elevation: string;
    frequency: string;
    range: string;
    multiuse: string;
    ident: string;
    name: string;
    airport: string;
    runway: string;
}

@Injectable()
export class NavaidsService {
    rowToNavaidFeature(row): Feature<Point, NavAidProperties> {
        return {
            type: 'Feature',
            id: row['si_id'],
            geometry: {
                type: 'Point',
                coordinates: [row['na_lon'], row['na_lat']],
            },
            properties: {
                id: row['na_id'],
                type: row['na_type'],
                elevation: row['na_elevation'],
                frequency: row['na_frequency'],
                range: row['na_range'],
                multiuse: row['na_multiuse'],
                ident: row['na_ident'],
                name: row['na_name'],
                airport: row['na_airport_id'],
                runway: row['na_runway'],
            },
        };
    }

    findWithinBoundary(boundary: Boundary): Promise<Feature<Point, NavAidProperties>[]> {
        return getConnection()
            .query(
                `SELECT na_id, ST_Y(na_position) AS na_lat, ST_X(na_position) AS na_lon, 
                    na_type, na_elevation, na_frequency, na_range, na_multiuse, na_ident, na_name, na_airport_id, na_runway 
                FROM fgs_navaids 
                WHERE ST_Within(na_position, ST_GeomFromText($1,4326)) 
                LIMIT 400`,
                [
                    util.format(
                        'POLYGON((%d %d,%d %d,%d %d,%d %d,%d %d))',
                        boundary.south,
                        boundary.west,
                        boundary.west,
                        boundary.north,
                        boundary.east,
                        boundary.north,
                        boundary.east,
                        boundary.south,
                        boundary.west,
                        boundary.south,
                    ),
                ],
            )
            .then((result) => {
                return result.map(this.rowToNavaidFeature);
            });
    }
}
