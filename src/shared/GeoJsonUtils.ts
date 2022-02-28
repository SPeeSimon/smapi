import { FeatureCollection, Feature, GeoJsonProperties, Geometry, Point, Position } from 'geojson';

type ID_Type = { id: any; }

export function toFeatureCollection<G extends Geometry | null = Geometry, P = GeoJsonProperties>(features: Feature<G, P>[]): FeatureCollection<G, P> {
    return {
      type: "FeatureCollection",
      features: features,
    };
}
  

export function toObjectFeature<P extends ID_Type>(properties: P, geometry: Point): Feature<Point, P> {
    return {
      type: "Feature",
      id: properties.id,
      geometry: geometry,
      properties: properties,
    };
  }


export function isPosition(pos: any): pos is Position {
  return Array.isArray(pos) && pos.length == 2 && typeof pos[0] === 'number' && typeof pos[1] === 'number';
}
