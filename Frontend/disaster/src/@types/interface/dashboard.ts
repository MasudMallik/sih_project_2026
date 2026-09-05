/**
 * Dashboard TypeScript Interfaces
 * Represents all data structures used in the Disaster Dashboard
 */

export interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Location {
  name: string;
  region: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export interface RiskCount {
  level: RiskLevel;
  label: string;
  count: number;
}

export interface RiskZone {
  id: string;
  level: RiskLevel;
  label: string;
  name: string;
  description: string;
  distance: string;
}

export interface RiskSummary {
  currentLevel: RiskLevel;
  message: string;
  zoneCount: number;
  counts: RiskCount[];
  zones: RiskZone[];
}

export type DisasterType = "Landslide" | "Flood" | "Fire" | "Accident";

export interface DisasterTypeOption {
  type: DisasterType;
  icon: string;
}

export interface WeatherStatistic {
  value: string;
  label: string;
}

export interface WeatherForecast {
  day: string;
  icon: string;
  temps: string;
}

export interface Weather {
  location: string;
  currentDay: string;
  temperature: number;
  condition: string;
  conditionIcon: string;
  stats: {
    rainfall: string;
    humidity: string;
    windGust: string;
  };
  stormAlert: string | null;
  forecast: WeatherForecast[];
}

export interface IncidentReport {
  location: string;
  disasterType: DisasterType | null;
  description?: string;
  timestamp?: string;
}

export interface IncidentReportResponse {
  success: boolean;
  message: string;
  incidentId?: string;
  teamNotified?: boolean;
}

export type SOSState = "idle" | "loading" | "success" | "error";

export interface SOSResponse {
  success: boolean;
  message: string;
  teamAssigned?: boolean;
  eta?: string;
}

export interface Dashboard {
  user: User;
  location: Location;
  risk: RiskSummary;
  weather: Weather;
  lastSyncTime: string;
  lastSyncMinutesAgo: number;
}

export interface DashboardLoadingState {
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
}
