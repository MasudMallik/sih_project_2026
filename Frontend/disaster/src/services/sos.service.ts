import type { SOSResponse } from "../@types/interface/dashboard";

interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

const getUserLocation = async (): Promise<UserLocation> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
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
        resolve({
          lat: 26.1445,
          lng: 91.7362,
          accuracy: 50,
        });
      }
    );
  });
};

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export const sendSOS = async (): Promise<SOSResponse> => {
  try {
    const location = await getUserLocation();

    try {
      window.location.href = `tel:1078`;
    } catch {
      // ignore
    }

    const token = localStorage.getItem("geo-rakshak:access-token");
    const response = await fetch(`${API_BASE_URL}/api/sos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ location, timestamp: Date.now() }),
    });

    if (!response.ok) {
      throw new Error(`SOS request failed with status ${response.status}`);
    }

    return (await response.json()) as SOSResponse;
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to send SOS signal. Please call emergency hotline 1078 directly.",
    };
  }
};

export const cancelSOS = async (_sosId: string): Promise<SOSResponse> => {
  void _sosId;
  return {
    success: false,
    message: "SOS cancellation not supported by server",
  };
};

export const getSOSStatus = async (_sosId: string): Promise<SOSResponse> => {
  void _sosId;
  return {
    success: false,
    message: "SOS status check not supported by server",
  };
};
