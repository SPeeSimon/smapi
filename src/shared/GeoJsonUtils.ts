import { Max, Min } from 'class-validator';
import { FeatureCollection, Feature, GeoJsonProperties, Geometry, Point, Position } from 'geojson';

type ID_Type = { id: any };

export function toFeatureCollection<G extends Geometry | null = Geometry, P = GeoJsonProperties>(
    features: Feature<G, P>[],
): FeatureCollection<G, P> {
    return {
        type: 'FeatureCollection',
        features: features,
    };
}

export function toObjectFeature<P extends ID_Type>(properties: P, geometry: Point): Feature<Point, P> {
    return {
        type: 'Feature',
        id: properties.id,
        geometry: geometry,
        properties: properties,
    };
}

export function isPosition(pos: any): pos is Position {
    return Array.isArray(pos) && pos.length == 2 && typeof pos[0] === 'number' && typeof pos[1] === 'number';
}

/**
 * Computes the STG heading into a true heading before submission to the database.
 * @param number stgHeading STG heading to convert
 * @return number true heading
 */
export function headingSTG2True(stgHeading: number) {
    if (stgHeading > 180) {
        return 540 - stgHeading;
    } else {
        return 180 - stgHeading;
    }
}

/**
 * Computes the true heading into a STG heading (for edition purposes).
 * @param number trueHeading true heading to convert
 * @return number STG heading
 */
export function headingTrue2STG(trueHeading: number) {
    if (trueHeading > 180) {
        return 540 - trueHeading;
    } else {
        return 180 - trueHeading;
    }
}

export class Longitude {
    @Min(-180)
    @Max(180)
    value: number;
}

export class Latitude {
    @Min(-90)
    @Max(90)
    value: number;
}

export class Offset {
    @Min(-1000)
    @Max(1000)
    value: number;
}

export class Heading {
    @Min(0)
    @Max(360)
    value: number;
}
