/**
 * Mock Dashboard Data
 * 
 * This file contains mock/development data for the dashboard.
 * Later, replace this data source with actual API calls to the backend.
 * 
 * The structure follows the TypeScript interfaces defined in dashboard.ts
 */

import type {
  Dashboard,
  User,
  Location,
  RiskSummary,
  Weather,
  DisasterTypeOption,
} from "../@types/interface/dashboard";

export const mockUser: User = {
  id: "user-001",
  name: "Mahesh Kulkarni",
  role: "Field Coordinator",
  avatar: "MK",
};

export const mockLocation: Location = {
  name: "Guwahati",
  region: "Assam — North Eastern Region",
  coordinates: {
    lat: 26.1445,
    lng: 91.7362,
  },
};

export const mockRiskCounts = [
  { level: "low" as const, label: "Low", count: 2 },
  { level: "moderate" as const, label: "Moderate", count: 1 },
  { level: "high" as const, label: "High", count: 2 },
  { level: "critical" as const, label: "Critical", count: 1 },
];

export const mockRiskZones = [
  {
    id: "zone-1",
    level: "critical" as const,
    label: "Critical",
    name: "Sonapur Ridge — landslide watch",
    description: "Active slope monitoring, heavy rainfall expected",
    distance: "3.1 km",
  },
  {
    id: "zone-2",
    level: "high" as const,
    label: "High",
    name: "Brahmaputra bank, Sector 4 — flood risk",
    description: "River level rising, evacuation standby",
    distance: "5.6 km",
  },
  {
    id: "zone-3",
    level: "high" as const,
    label: "High",
    name: "Khanapara slope — soil saturation",
    description: "Heavy moisture content, risk escalating",
    distance: "7.8 km",
  },
  {
    id: "zone-4",
    level: "moderate" as const,
    label: "Moderate",
    name: "NH-27 bridge crossing — water level rising",
    description: "Access route under observation",
    distance: "9.2 km",
  },
];

export const mockRiskSummary: RiskSummary = {
  currentLevel: "high",
  message: "Elevated risk — monsoon runoff",
  zoneCount: 6,
  counts: mockRiskCounts,
  zones: mockRiskZones,
};

export const mockWeather: Weather = {
  location: "Guwahati",
  currentDay: "Friday · Today",
  temperature: 27,
  condition: "Thundershowers, heavy at times",
  conditionIcon: "🌧",
  stats: {
    rainfall: "64mm",
    humidity: "88%",
    windGust: "41km/h",
  },
  stormAlert: "Storm indicator active — heavy rain expected 4–7 PM",
  forecast: [
    { day: "Fri", icon: "🌩", temps: "27° / 22°" },
    { day: "Sat", icon: "🌧", temps: "27° / 24°" },
    { day: "Sun", icon: "🌧", temps: "28° / 24°" },
    { day: "Mon", icon: "⛅", temps: "29° / 24°" },
    { day: "Tue", icon: "🌧", temps: "28° / 24°" },
  ],
};

export const mockDisasterTypes: DisasterTypeOption[] = [
  { type: "Landslide", icon: "⛰" },
  { type: "Flood", icon: "🌊" },
  { type: "Fire", icon: "🔥" },
  { type: "Accident", icon: "🚧" },
];

export const mockDashboard: Dashboard = {
  user: mockUser,
  location: mockLocation,
  risk: mockRiskSummary,
  weather: mockWeather,
  disasterTypes: mockDisasterTypes,
  lastSyncTime: new Date().toISOString(),
  lastSyncMinutesAgo: 2,
};

/**
 * FUTURE: Replace this function with actual API call
 * 
 * Example of how to replace this:
 * 
 * export const fetchDashboard = async (): Promise<Dashboard> => {
 *   const response = await fetch('/api/dashboard', {
 *     headers: { 'Authorization': `Bearer ${token}` }
 *   });
 *   if (!response.ok) throw new Error('Failed to fetch dashboard');
 *   return response.json();
 * };
 */
export const getMockDashboard = (): Dashboard => {
  return mockDashboard;
};
