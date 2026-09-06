/**
 * Dashboard Service - Data Fetching
 * 
 * Dashboard data is owned by the backend and database. This service is the
 * frontend boundary for that API response.
 */

import type { Dashboard, DashboardLoadingState } from "../@types/interface/dashboard";

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

/**
 * Fetch dashboard data
 * 
 * Fetch the dashboard assembled by the backend from the database.
 */
export const fetchDashboard = async (): Promise<Dashboard> => {
  const token = localStorage.getItem("geo-rakshak:access-token");
  const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to load dashboard (${response.status})`);
  }

  return (await response.json()) as Dashboard;
};

/**
 * Create initial loading state
 */
export const createLoadingState = (): DashboardLoadingState => ({
  isLoading: true,
  error: null,
  isEmpty: false,
});

/**
 * Create error state
 */
export const createErrorState = (message: string): DashboardLoadingState => ({
  isLoading: false,
  error: message,
  isEmpty: false,
});

/**
 * Create success state
 */
export const createSuccessState = (): DashboardLoadingState => ({
  isLoading: false,
  error: null,
  isEmpty: false,
});

/**
 * FUTURE: Add more dashboard service functions as needed
 * - refreshDashboard()
 * - subscribeToDashboardUpdates()
 * - getDashboardSection() - fetch specific sections
 * - updateUserPreferences()
 * - etc.
 */
