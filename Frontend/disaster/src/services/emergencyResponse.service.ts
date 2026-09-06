import type { EmergencyResponseData } from "../@types/interface/emergencyResponse";
import { emergencyResponseSchema } from "../validations/emergencyResponseValidation";

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export async function fetchEmergencyResponse(location?: string): Promise<EmergencyResponseData> {
  const token = localStorage.getItem("geo-rakshak:access-token");
  const url = location
    ? `${API_BASE_URL}/api/emergency-response?location=${encodeURIComponent(location)}`
    : `${API_BASE_URL}/api/emergency-response`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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
