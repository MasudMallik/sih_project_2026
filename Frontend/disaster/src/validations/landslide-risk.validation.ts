import { z } from "zod";
import type { LandslideRiskInput } from "../@types/interface/landslide-risk";

export const landslideRiskFormSchema = z.object({
  rainfall: z.coerce
    .number({ message: "Rainfall must be a valid number" })
    .min(50, "Rainfall must be between 50 and 300 mm")
    .max(300, "Rainfall must be between 50 and 300 mm")
    .default(0),
  slopeAngle: z.coerce
    .number({ message: "Slope angle must be a valid number" })
    .min(50, "Slope angle must be between 50 and 60°")
    .max(60, "Slope angle must be between 50 and 60°")
    .default(0),
  soilSaturation: z.coerce
    .number({ message: "Soil saturation must be a valid number" })
    .min(0, "Soil saturation must be between 0 and 1")
    .max(1, "Soil saturation must be between 0 and 1")
    .default(0),
  vegetationCover: z.coerce
    .number({ message: "Vegetation cover must be a valid number" })
    .min(0, "Vegetation cover must be between 0 and 1")
    .max(1, "Vegetation cover must be between 0 and 1")
    .default(0),
  earthquakeActivity: z.coerce
    .number({ message: "Earthquake activity must be a valid number" })
    .min(0, "Earthquake activity must be between 0 and 7")
    .max(7, "Earthquake activity must be between 0 and 7")
    .default(0),
  proximityToWater: z.coerce
    .number({ message: "Proximity to water must be a valid number" })
    .min(0, "Proximity to water must be between 0 and 2")
    .max(2, "Proximity to water must be between 0 and 2")
    .default(0),
  soilGravel: z.coerce
    .number({ message: "Soil Type Gravel must be 0 or 1" })
    .refine((val) => val === 0 || val === 1, "Soil Type Gravel must be 0 or 1")
    .default(0),
  soilSand: z.coerce
    .number({ message: "Soil Type Sand must be 0 or 1" })
    .refine((val) => val === 0 || val === 1, "Soil Type Sand must be 0 or 1")
    .default(0),
  soilSilt: z.coerce
    .number({ message: "Soil Type Silt must be 0 or 1" })
    .refine((val) => val === 0 || val === 1, "Soil Type Silt must be 0 or 1")
    .default(0),
});

export const aiPredictionPayloadSchema = z.object({
  Rainfall_mm: z.number().min(50, "Rainfall must be between 50 and 300 mm").max(300, "Rainfall must be between 50 and 300 mm"),
  Slope_Angle: z.number().min(50, "Slope angle must be between 50 and 60°").max(60, "Slope angle must be between 50 and 60°"),
  Soil_Saturation: z.number().min(0, "Soil saturation must be between 0 and 1").max(1, "Soil saturation must be between 0 and 1"),
  Vegetation_Cover: z.number().min(0, "Vegetation cover must be between 0 and 1").max(1, "Vegetation cover must be between 0 and 1"),
  Earthquake_Activity: z.number().min(0, "Earthquake activity must be between 0 and 7").max(7, "Earthquake activity must be between 0 and 7"),
  Proximity_to_Water: z.number().min(0, "Proximity to water must be between 0 and 2").max(2, "Proximity to water must be between 0 and 2"),
  Soil_Type_Gravel: z.number().int().refine((v) => v === 0 || v === 1, "Soil Type Gravel must be 0 or 1"),
  Soil_Type_Sand: z.number().int().refine((v) => v === 0 || v === 1, "Soil Type Sand must be 0 or 1"),
  Soil_Type_Silt: z.number().int().refine((v) => v === 0 || v === 1, "Soil Type Silt must be 0 or 1"),
});

export const aiPredictionResponseSchema = z.object({
  success: z.boolean(),
  prediction: z.number().int(),
  probability: z.number(),
  message: z.string().optional(),
});

export type LandslideRiskFormData = z.infer<typeof landslideRiskFormSchema>;
export type LandslideRiskFormErrors = Partial<Record<keyof LandslideRiskFormData, string>>;

export function mapFormToPayload(data: LandslideRiskFormData): LandslideRiskInput {
  return {
    Rainfall_mm: Number(data.rainfall),
    Slope_Angle: Number(data.slopeAngle),
    Soil_Saturation: Number(data.soilSaturation),
    Vegetation_Cover: Number(data.vegetationCover),
    Earthquake_Activity: Number(data.earthquakeActivity),
    Proximity_to_Water: Number(data.proximityToWater),
    Soil_Type_Gravel: Number(data.soilGravel),
    Soil_Type_Sand: Number(data.soilSand),
    Soil_Type_Silt: Number(data.soilSilt),
  };
}

export function validateLandslideRiskForm(data: unknown): {
  valid: boolean;
  data: LandslideRiskFormData | null;
  errors: LandslideRiskFormErrors | null;
} {
  const result = landslideRiskFormSchema.safeParse(data);
  if (result.success) {
    return { valid: true, data: result.data, errors: null };
  }

  const errors: LandslideRiskFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof LandslideRiskFormData;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return { valid: false, data: null, errors };
}
