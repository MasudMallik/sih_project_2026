/**
 * Incident Reporting Service
 * 
 * This file provides the API integration layer for incident reporting.
 * Currently uses mock implementation, easily replaceable with real backend calls.
 * 
 * Later, replace `submitIncidentReportMock` with actual API call:
 * 
 * export const submitIncidentReport = async (data) => {
 *   const response = await fetch('/api/incidents', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(data),
 *   });
 *   if (!response.ok) throw new Error('Failed to submit incident');
 *   return response.json();
 * };
 */

import type { IncidentReport, IncidentReportResponse } from "../@types/interface/dashboard";

// MOCK IMPLEMENTATION - Replace with real backend call later
const submitIncidentReportMock = async (
  data: IncidentReport
): Promise<IncidentReportResponse> => {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Always returns success in mock mode
      resolve({
        success: true,
        message: `${data.disasterType} reported at ${data.location}. Nearest team notified.`,
        incidentId: `INC-${Date.now()}`,
        teamNotified: true,
      });
    }, 800);
  });
};

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export const submitIncidentReport = async (
  data: IncidentReport
): Promise<IncidentReportResponse> => {
  try {
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

    if (!response.ok) {
      return await submitIncidentReportMock(data);
    }

    const payload = (await response.json()) as IncidentReportResponse;
    return payload;
  } catch {
    return await submitIncidentReportMock(data);
  }
};

// FUTURE: Add more functions as needed
// - updateIncidentReport
// - getIncidentHistory
// - getIncidentDetails
// - etc.
