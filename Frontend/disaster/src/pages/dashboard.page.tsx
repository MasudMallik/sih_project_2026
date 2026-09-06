import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { RiskSummary } from "../components/dashboard/RiskSummary";
import { WeatherSnapshot } from "../components/dashboard/WeatherSnapshot";
import { IncidentReportForm } from "../components/dashboard/IncidentReportForm";
import { SOSButton } from "../components/dashboard/SOSButton";
import type { Dashboard, DisasterType, SOSState } from "../@types/interface/dashboard";
import { fetchDashboard } from "../services/dashboard.service";
import { submitIncidentReport } from "../services/incident.service";
import { sendSOS } from "../services/sos.service";
import { getCurrentUser } from "../services/auth.service";
import { AIPredictionButton } from "../components/dashboard/AIPredictionButton";

export default function DisasterDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sosState, setSOSState] = useState<SOSState>("idle");

  const authUser = getCurrentUser();

  // Load dashboard data on mount
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchDashboard();
        setDashboard(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard"
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const handleIncidentSubmit = async (data: {
    location: string;
    disasterType: string;
    description?: string;
  }) => {
    try {
      const response = await submitIncidentReport({
        location: data.location,
        disasterType: data.disasterType as DisasterType,
        description: data.description,
        timestamp: new Date().toISOString(),
      });

      return {
        success: response.success,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to submit",
      };
    }
  };

  const handleSOS = async () => {
    try {
      setSOSState("loading");
      const response = await sendSOS();

      if (response.success) {
        setSOSState("success");
        setTimeout(() => setSOSState("idle"), 4500);
      } else {
        setSOSState("error");
        setTimeout(() => setSOSState("idle"), 4500);
      }
    } catch {
      setSOSState("error");
      setTimeout(() => setSOSState("idle"), 4500);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout
        user={{
          id: "loading",
          name: "Loading...",
          role: "Loading...",
          avatar: "—",
        }}
      >
        <div className="mx-auto max-w-[1200px] px-6 py-8 lg:px-9">
          <div className="animate-pulse space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-10 w-64 rounded-xl bg-[#2A4632]"></div>
              <div className="h-10 w-40 rounded-xl bg-[#2A4632]"></div>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.55fr_1fr]">
              <div className="h-96 rounded-2xl bg-[#2A4632]"></div>
              <div className="h-96 rounded-2xl bg-[#2A4632]"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !dashboard) {
    return (
      <DashboardLayout
        user={{
          id: "error",
          name: "Error",
          role: "Unable to load",
          avatar: "!",
        }}
      >
        <div className="mx-auto max-w-[1200px] px-6 py-8 lg:px-9">
          <div className="rounded-2xl border border-red-400/40 bg-red-950/40 p-6 shadow-2xl">
            <h2 className="mb-2 text-xl font-semibold text-red-200">
              Unable to Load Dashboard
            </h2>
            <p className="text-[#8AA68F]">
              {error || "An unknown error occurred. Please refresh the page."}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      user={dashboard.user}
      email={authUser?.email}
      onProfileClick={() => navigate("/profile")}
    >
      {/* Main Dashboard Container */}
      <div className="mx-auto max-w-[1200px] px-6 py-6 pb-[60px] lg:px-9 lg:py-8">
        {/* Header Row: Greeting, Status, and AI Action */}
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#F4EFE4] sm:text-4xl">
              Good morning, {dashboard.user.name.split(" ")[0]}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-[13px] text-[#8AA68F]">
              <span>📍 {dashboard.location.name} — {dashboard.location.region}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B7CBB2]">
                <span className="h-2 w-2 rounded-full bg-[#4CAF6D] animate-pulse" />
                Live synced {dashboard.lastSyncMinutesAgo}m ago
              </span>
            </div>
          </div>

          <div className="flex items-center">
            <AIPredictionButton disabled={isLoading} />
          </div>
        </div>

        {/* Circular Emergency SOS Center (matching screenshot without banner header) */}
        <div className="mb-8">
          <SOSButton state={sosState} onTap={handleSOS} disabled={isLoading} />
        </div>

        {/* Risk & Weather Grid */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.55fr_1fr]">
          <RiskSummary data={dashboard.risk} isLoading={isLoading} />
          <WeatherSnapshot data={dashboard.weather} isLoading={isLoading} />
        </div>

        {/* Incident Report Form */}
        <IncidentReportForm
          disasterTypes={dashboard.disasterTypes}
          onSubmit={handleIncidentSubmit}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
}