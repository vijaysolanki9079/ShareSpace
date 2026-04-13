declare module 'geojson' {
  export type Position = number[];

  export interface GeometryObject {
    type: string;
    bbox?: number[];
  }

  export interface Point extends GeometryObject {
    type: 'Point';
    coordinates: Position;
  }

  export interface MultiPoint extends GeometryObject {
    type: 'MultiPoint';
    coordinates: Position[];
  }

  export interface LineString extends GeometryObject {
    type: 'LineString';
    coordinates: Position[];
  }

  export interface MultiLineString extends GeometryObject {
    type: 'MultiLineString';
    coordinates: Position[][];
  }

  export interface Polygon extends GeometryObject {
    type: 'Polygon';
    coordinates: Position[][];
  }

  export interface MultiPolygon extends GeometryObject {
    type: 'MultiPolygon';
    coordinates: Position[][][];
  }

  export interface GeometryCollection<G extends Geometry = Geometry> extends GeometryObject {
    type: 'GeometryCollection';
    geometries: G[];
  }

  export type Geometry =
    | Point
    | MultiPoint
    | LineString
    | MultiLineString
    | Polygon
    | MultiPolygon
    | GeometryCollection;

  export interface Feature<G extends Geometry | null = Geometry, P = Record<string, unknown>> {
    type: 'Feature';
    geometry: G;
    properties: P;
    id?: string | number;
    bbox?: number[];
  }

  export interface FeatureCollection<G extends Geometry | null = Geometry, P = Record<string, unknown>> {
    type: 'FeatureCollection';
    features: Array<Feature<G, P>>;
    bbox?: number[];
  }
}
