/**
 * SOS Service - Emergency Response
 * 
 * This file provides the API integration layer for SOS emergency calls.
 * Currently uses phone fallback + mock implementation for backend.
 * 
 * Later, replace `sendSOSMock` with actual backend API:
 * 
 * export const sendSOS = async (location: Coordinates) => {
 *   const response = await fetch('/api/sos/trigger', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ location, timestamp: Date.now() }),
 *   });
 *   if (!response.ok) throw new Error('SOS failed');
 *   return response.json();
 * };
 */

import type { SOSResponse } from "../@types/interface/dashboard";

interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

/**
 * Get user's current location
 * For now, returns mock location - in production, use browser geolocation API
 */
const getUserLocation = async (): Promise<UserLocation> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      // Mock location fallback
      resolve({
        lat: 26.1445,
        lng: 91.7362,
        accuracy: 50,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      () => {
        // Fallback to mock location if permission denied
        resolve({
          lat: 26.1445,
          lng: 91.7362,
          accuracy: 50,
        });
      }
    );
  });
};

// MOCK IMPLEMENTATION - Replace with real backend call
const sendSOSMock = async (_location: UserLocation): Promise<SOSResponse> => {
  void _location;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "SOS signal sent. Rescue team dispatched to your location.",
        teamAssigned: true,
        eta: "12-15 minutes",
      });
    }, 1200);
  });
};

/**
 * Send SOS emergency signal
 * 
 * Flow:
 * 1. Get user location (browser geolocation)
 * 2. Make phone call to 1078 (emergency number)
 * 3. Send SOS signal to backend (when connected)
 * 4. Return response with team assignment details
 */
export const sendSOS = async (): Promise<SOSResponse> => {
  try {
    // Get location
    const location = await getUserLocation();

    // Initiate phone call to emergency number
    // This happens regardless of backend response
    const phoneNumber = "1078";
    window.location.href = `tel:${phoneNumber}`;

    // Send to backend (MOCK - replace later)
    const result = await sendSOSMock(location);

    // Return response
    return result;
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to send SOS. Please call 1078 directly.",
    };
  }
};

/**
 * Cancel SOS signal (if backend supports cancellation)
 * FUTURE: Implement when backend is ready
 */
export const cancelSOS = async (_sosId: string): Promise<SOSResponse> => {
  void _sosId;
  return {
    success: false,
    message: "SOS cancellation not yet implemented",
  };
};

/**
 * Get SOS status
 * FUTURE: Check status of active SOS signals
 */
export const getSOSStatus = async (_sosId: string): Promise<SOSResponse> => {
  void _sosId;
  return {
    success: false,
    message: "SOS status check not yet implemented",
  };
};
