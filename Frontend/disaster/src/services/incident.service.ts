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

/**
 * Submit an incident report
 * FRONTEND ONLY - no backend validation happens here
 * Backend will validate when this is connected
 */
export const submitIncidentReport = async (
  data: IncidentReport
): Promise<IncidentReportResponse> => {
  try {
    // For now, use mock. Later replace with real API call:
    // const response = await fetch('/api/incidents/report', { ... });
    const result = await submitIncidentReportMock(data);
    return result;
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to submit incident report",
    };
  }
};

// FUTURE: Add more functions as needed
// - updateIncidentReport
// - getIncidentHistory
// - getIncidentDetails
// - etc.
