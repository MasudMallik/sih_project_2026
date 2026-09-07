import { z } from "zod";
import type { Hospital, MapData, PolygonGeometry, RiskLevel, Road, Sensor, Village } from "../interfaces/map.interface";

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

export const villageSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string().min(1),
  coordinate: coordinateSchema,
  population: optionalNumber,
  riskLevel: riskLevelSchema.optional(),
}).passthrough();

export const hospitalSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string().min(1),
  coordinate: coordinateSchema,
  beds: optionalNumber,
}).passthrough();

export const sensorSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string().min(1),
  coordinate: coordinateSchema,
  status: z.enum(["Active", "Offline", "Unknown"]).optional().default("Active"),
  reading: optionalString,
}).passthrough();

const responseSchema = z.object({
  success: z.boolean(),
  count: z.number().int().nonnegative().optional(),
  risks: z.array(riskZoneSchema).default([]),
  roads: z.array(roadSchema).optional().default([]),
  villages: z.array(villageSchema).optional().default([]),
  hospitals: z.array(hospitalSchema).optional().default([]),
  sensors: z.array(sensorSchema).optional().default([]),
});

export function parseMapResponse(value: unknown): MapData {
  const response = responseSchema.parse(value);
  return {
    zones: response.risks,
    roads: response.roads as Road[],
    villages: response.villages as Village[],
    hospitals: response.hospitals as Hospital[],
    sensors: response.sensors as Sensor[],
    receivedAt: new Date().toISOString(),
  };
}

export function riskColor(level: RiskLevel | undefined): string {
  return {
    Low: "#38E07B",
    Medium: "#F59E0B",
    High: "#FB923C",
    Critical: "#EF4444",
  }[level ?? "Low"];
}
