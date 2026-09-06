/**
 * Landslide Risk Prediction Interfaces
 */

export interface LandslideRiskInput {
  Rainfall_mm: number;
  Slope_Angle: number;
  Soil_Saturation: number;
  Vegetation_Cover: number;
  Earthquake_Activity: number;
  Proximity_to_Water: number;
  Soil_Type_Gravel: number;
  Soil_Type_Sand: number;
  Soil_Type_Silt: number;
}

export interface LandslideRiskFormData {
  rainfall: number;
  slopeAngle: number;
  soilSaturation: number;
  vegetationCover: number;
  earthquakeActivity: number;
  proximityToWater: number;
  soilGravel: number;
  soilSand: number;
  soilSilt: number;
}

export interface AIPredictionResponse {
  success: boolean;
  prediction: number; // 1 = Landslide hazard detected, 0 = Safe
  probability: number; // 0 to 100 percentage
  message?: string;
}

export type LandslideRiskSeverity = "High" | "Moderate" | "Low";

export interface LandslideRiskAssessment {
  riskLevel: LandslideRiskSeverity;
  isHazard: boolean;
  probability: number;
  prediction: number;
  recommendation: string;
  evaluatedAt: string;
}
