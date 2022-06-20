import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { Point, Feature } from 'geojson';
import { Boundary } from 'src/shared/dto/Boundary.dto';
import { toObjectFeature } from 'src/shared/GeoJsonUtils';
const util = require('util');

export interface SignProperties {
    id: string;
    heading: string;
    definition: string;
    gndelev: string;
}

@Injectable()
export class SignsService {
    rowToSignsFeature(row): Feature<Point, SignProperties> {
        return toObjectFeature(
            {
                id: row['si_id'],
                heading: row['si_heading'],
                definition: row['si_definition'],
                gndelev: row['si_gndelev'],
            },
            {
                type: 'Point',
                coordinates: [row['ob_lon'], row['ob_lat']],
            },
        );
    }

    findWithinBoundary(boundary: Boundary): Promise<Feature<Point, SignProperties>[]> {
        return getConnection()
            .query(
                `SELECT si_id, ST_Y(wkb_geometry) AS ob_lat, ST_X(wkb_geometry) AS ob_lon, 
            si_heading, si_gndelev, si_definition 
            FROM fgs_signs 
            WHERE ST_Within(wkb_geometry, ST_GeomFromText($1,4326)) 
            LIMIT 400`,
                [
                    util.format(
                        'POLYGON((%d %d,%d %d,%d %d,%d %d,%d %d))',
                        boundary.west,
                        boundary.south,
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
                return result.map(this.rowToSignsFeature);
            });
    }
}
