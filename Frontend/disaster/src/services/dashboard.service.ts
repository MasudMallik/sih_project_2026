/**
 * Dashboard Service - Data Fetching
 * 
 * This file provides the API integration layer for dashboard data.
 * Currently uses mock data, easily replaceable with backend API calls.
 * 
 * Later, replace `getMockDashboard` with real API call:
 * 
 * export const fetchDashboard = async () => {
 *   const response = await fetch('/api/dashboard', {
 *     headers: { 'Authorization': `Bearer ${token}` }
 *   });
 *   if (!response.ok) throw new Error('Failed to fetch dashboard');
 *   return response.json();
 * };
 */

import { getMockDashboard } from "../mock/dashboard.mock";
import type { Dashboard, DashboardLoadingState } from "../@types/interface/dashboard";

/**
 * Fetch dashboard data
 * 
 * Currently returns mock data.
 * Later, connect to backend API and replace mock implementation.
 * 
 * TODO: Replace getMockDashboard() with actual API call
 */
export const fetchDashboard = async (): Promise<Dashboard> => {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // TODO: Replace with real API call:
    // const response = await fetch('/api/dashboard', {
    //   headers: { 'Authorization': `Bearer ${getToken()}` }
    // });
    // if (!response.ok) throw new Error('Failed to fetch dashboard');
    // return response.json();

    return getMockDashboard();
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to fetch dashboard");
  }
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
