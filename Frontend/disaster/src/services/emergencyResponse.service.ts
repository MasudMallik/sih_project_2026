import type { EmergencyResponseData } from "../@types/interface/emergencyResponse";
import { emergencyResponseSchema } from "../validations/emergencyResponseValidation";

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export async function fetchEmergencyResponse(): Promise<EmergencyResponseData> {
  const response = await fetch(`${API_BASE_URL}/api/emergency-response`, {
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Unable to load emergency response data (${response.status})`);
  }

  const payload: unknown = await response.json();
  const result = emergencyResponseSchema.safeParse(payload);
  if (!result.success) {
    throw new Error("Emergency response data from the server has an invalid shape");
  }

  return result.data;
}
