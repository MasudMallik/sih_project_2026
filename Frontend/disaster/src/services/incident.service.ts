import type { IncidentReport, IncidentReportResponse } from "../@types/interface/dashboard";

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export const submitIncidentReport = async (
  data: IncidentReport
): Promise<IncidentReportResponse> => {
  const token = localStorage.getItem("geo-rakshak:access-token");
  const response = await fetch(`${API_BASE_URL}/api/incidents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  const payload = (await response.json().catch(() => null)) as (IncidentReportResponse & { detail?: string }) | null;

  if (!response.ok) {
    const detail = payload && "detail" in payload ? payload.detail : undefined;
    throw new Error(detail || `Failed to submit incident report (${response.status})`);
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid response received from incident submission API.");
  }

  return payload;
};
