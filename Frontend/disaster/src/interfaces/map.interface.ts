export const RISK_LEVELS = ["Low", "Medium", "High", "Critical"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export type MapEntityKind = "zone" | "village" | "hospital" | "sensor" | "road";

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface PolygonGeometry {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
}

export interface LineGeometry {
  type: "LineString" | "MultiLineString";
  coordinates: number[][] | number[][][];
}

export interface RiskZone {
  id: string;
  name: string;
  type?: string;
  district?: string;
  geometry?: PolygonGeometry;
  center?: Coordinate;
  riskLevel?: RiskLevel;
  riskScore?: number;
  rainfall24h?: number;
  soilMoisture?: number;
  slope?: number;
  prevLandslides?: number;
  aiProbability?: number;
  recommendedAction?: string;
  lastIncident?: string;
}

export interface Road {
  id: string;
  name: string;
  riskLevel?: RiskLevel;
  geometry?: LineGeometry;
}

export interface Village {
  id: string;
  name: string;
  coordinate: Coordinate;
  population?: number;
  riskLevel?: RiskLevel;
}

export interface Hospital {
  id: string;
  name: string;
  coordinate: Coordinate;
  beds?: number;
}

export type SensorStatus = "Active" | "Offline" | "Unknown";

export interface Sensor {
  id: string;
  name: string;
  coordinate: Coordinate;
  status?: SensorStatus;
  reading?: string;
}

export interface MapData {
  zones: RiskZone[];
  roads: Road[];
  villages: Village[];
  hospitals: Hospital[];
  sensors: Sensor[];
  receivedAt: string;
}

export interface SearchResult {
  id: string;
  name: string;
  type: string;
  kind: MapEntityKind;
  coordinate?: Coordinate;
}

export interface MapSelection {
  kind: MapEntityKind;
  data: RiskZone | Road | Village | Hospital | Sensor;
}

export type LayerKey = "heatmap" | "rainfall" | "soilMoisture" | "slope" | "roads" | "villages" | "hospitals" | "sensors" | "satellite";
export type LayerState = Record<LayerKey, boolean>;
