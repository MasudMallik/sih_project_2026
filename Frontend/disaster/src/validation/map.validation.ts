import { z } from "zod";
import type { MapData, PolygonGeometry, RiskLevel } from "../interfaces/map.interface";

const riskLevelSchema = z.enum(["Low", "Medium", "High", "Critical"]);
const coordinateSchema = z.object({ lat: z.number().finite(), lng: z.number().finite() });
const polygonGeometrySchema = z.object({
  type: z.enum(["Polygon", "MultiPolygon"]),
  coordinates: z.array(z.unknown()),
}).transform((value) => value as PolygonGeometry);
const lineGeometrySchema = z.object({
  type: z.enum(["LineString", "MultiLineString"]),
  coordinates: z.array(z.unknown()),
});

const optionalNumber = z.number().finite().optional().nullable().transform((value) => value ?? undefined);
const optionalString = z.string().optional().nullable().transform((value) => value ?? undefined);

export const riskZoneSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string().min(1),
  type: optionalString,
  district: optionalString,
  geometry: polygonGeometrySchema.optional(),
  center: coordinateSchema.optional(),
  riskLevel: riskLevelSchema.optional(),
  riskScore: optionalNumber,
  rainfall24h: optionalNumber,
  soilMoisture: optionalNumber,
  slope: optionalNumber,
  prevLandslides: optionalNumber,
  aiProbability: optionalNumber,
  recommendedAction: optionalString,
  lastIncident: optionalString,
}).passthrough();

export const roadSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string().min(1),
  riskLevel: riskLevelSchema.optional(),
  geometry: lineGeometrySchema.optional(),
}).passthrough();

const responseSchema = z.object({
  success: z.boolean(),
  count: z.number().int().nonnegative().optional(),
  risks: z.array(riskZoneSchema),
});

export function parseMapResponse(value: unknown): MapData {
  const response = responseSchema.parse(value);
  return {
    zones: response.risks,
    roads: [],
    villages: [],
    hospitals: [],
    sensors: [],
    receivedAt: new Date().toISOString(),
  };
}

export function riskColor(level: RiskLevel | undefined): string {
  return {
    Low: "#4caf6d",
    Medium: "#f2c14e",
    High: "#ef8a3d",
    Critical: "#e14b3c",
  }[level ?? "Low"];
}
