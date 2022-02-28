import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { Point, Feature } from 'geojson';
const util = require("util");

export interface SignProperties {
    id: string;
    heading: string;
    definition: string;
    gndelev: string;
}

@Injectable()
export class SignsService {
    rowToSignsFeature(row): Feature<Point, SignProperties> {
        return {
            type: 'Feature',
            id: row['si_id'],
            geometry: {
                type: 'Point',
                coordinates: [row['ob_lon'], row['ob_lat']],
            },
            properties: {
                id: row['si_id'],
                heading: row['si_heading'],
                definition: row['si_definition'],
                gndelev: row['si_gndelev'],
            },
        };
    }

    findWithinBoundary(east: number, west: number, north: number, south: number): Promise<Feature<Point, SignProperties>[]> {
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
                        west,
                        south,
                        west,
                        north,
                        east,
                        north,
                        east,
                        south,
                        west,
                        south,
                    ),
                ],
            )
            .then((result) => {
                return result.map(this.rowToSignsFeature);
            });
    }
}
