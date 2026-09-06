import type {
  LandslideRiskInput,
  AIPredictionResponse,
  LandslideRiskAssessment,
  LandslideRiskSeverity,
} from "../@types/interface/landslide-risk";
import {
  aiPredictionPayloadSchema,
  aiPredictionResponseSchema,
  type LandslideRiskFormData,
  mapFormToPayload,
} from "../validations/landslide-risk.validation";
import { landslideRiskRoutes } from "../routes/landslide-risk.routes";

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

/**
 * Heuristic fallback if backend is unreachable or undergoing maintenance
 */
function calculateFallbackPrediction(data: LandslideRiskInput): AIPredictionResponse {
  const rainWeight = ((data.Rainfall_mm - 50) / 250.0) * 35.0;
  const slopeWeight = ((data.Slope_Angle - 50) / 10.0) * 25.0;
  const satWeight = data.Soil_Saturation * 25.0;
  const eqWeight = (data.Earthquake_Activity / 7.0) * 15.0;
  const vegOffset = data.Vegetation_Cover * 15.0;
  const soilBonus = data.Soil_Type_Silt === 1 ? 10.0 : data.Soil_Type_Sand === 1 ? 5.0 : 0;

  const score = rainWeight + slopeWeight + satWeight + eqWeight - vegOffset + soilBonus;
  const predictedClass = score > 45 ? 1 : 0;
  const probability = Math.min(99.0, Math.max(1.0, Math.round(Math.max(1.0, score) * 100) / 100));

  return {
    success: true,
    prediction: predictedClass,
    probability,
    message: "Calculated via fallback heuristic model engine",
  };
}

/**
 * Determine risk level string and safety recommendation from prediction and probability
 */
function deriveAssessment(
  prediction: number,
  probability: number
): { riskLevel: LandslideRiskSeverity; isHazard: boolean; recommendation: string } {
  const isHazard = prediction === 1 || probability >= 60;

  let riskLevel: LandslideRiskSeverity = "Low";
  let recommendation = "Terrain conditions are stable. Standard routine surveillance advised.";

  if (probability >= 70 || (isHazard && probability >= 60)) {
    riskLevel = "High";
    recommendation =
      "CRITICAL: High probability of slope failure detected. Issue slope warning, alert disaster management teams, and prepare evacuation corridors.";
  } else if (probability >= 40 || isHazard) {
    riskLevel = "Moderate";
    recommendation =
      "WARNING: Elevated slope instability detected. Deploy drone surveillance, inspect drainage channels, and monitor precipitation closely.";
  }

  return {
    riskLevel,
    isHazard,
    recommendation,
  };
}

/**
 * Submit environmental and geological parameters to AI prediction endpoint
 */
export async function predictLandslideRisk(
  formData: LandslideRiskFormData,
  signal?: AbortSignal
): Promise<LandslideRiskAssessment> {
  const payload = mapFormToPayload(formData);
  
  // Validate payload through Zod before network transmission
  const validatedPayload = aiPredictionPayloadSchema.parse(payload);
  const token = localStorage.getItem("geo-rakshak:access-token");

  let rawData: unknown;

  try {
    const response = await fetch(`${API_BASE_URL}${landslideRiskRoutes.apiPrediction}`, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(validatedPayload),
    });

    if (!response.ok) {
      // Try fallback direct route /ai-prediction
      const fallbackResponse = await fetch(`${API_BASE_URL}${landslideRiskRoutes.directPrediction}`, {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(validatedPayload),
      });

      if (!fallbackResponse.ok) {
        throw new Error(`AI Prediction endpoint responded with status ${response.status}`);
      }
      rawData = await fallbackResponse.json();
    } else {
      rawData = await response.json();
    }
  } catch {
    // If backend network fails, use deterministic heuristic calculation so UI remains functional
    rawData = calculateFallbackPrediction(validatedPayload);
  }

  // Parse and validate response structure with Zod
  const parsed = aiPredictionResponseSchema.parse(rawData);
  const { riskLevel, isHazard, recommendation } = deriveAssessment(parsed.prediction, parsed.probability);

  return {
    riskLevel,
    isHazard,
    probability: parsed.probability,
    prediction: parsed.prediction,
    recommendation,
    evaluatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}
