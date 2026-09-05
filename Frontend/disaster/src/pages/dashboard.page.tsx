import { useState, useEffect } from "react";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { RiskSummary } from "../components/dashboard/RiskSummary";
import { WeatherSnapshot } from "../components/dashboard/WeatherSnapshot";
import { IncidentReportForm } from "../components/dashboard/IncidentReportForm";
import { SOSButton } from "../components/dashboard/SOSButton";
import type { Dashboard, SOSState } from "../@types/interface/dashboard";
import { fetchDashboard } from "../services/dashboard.service";
import { submitIncidentReport } from "../services/incident.service";
import { sendSOS } from "../services/sos.service";
import { mockDisasterTypes } from "../mock/dashboard.mock";

export default function DisasterDashboard() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sosState, setSOSState] = useState<SOSState>("idle");

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

    loadDashboard();
  }, []);

  const handleIncidentSubmit = async (data: {
    location: string;
    disasterType: string;
    description?: string;
  }) => {
    try {
      const response = await submitIncidentReport({
        location: data.location,
        disasterType: data.disasterType as any,
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
        setTimeout(() => setSOSState("idle"), 4000);
      } else {
        setSOSState("error");
        setTimeout(() => setSOSState("idle"), 4000);
      }
    } catch (error) {
      setSOSState("error");
      setTimeout(() => setSOSState("idle"), 4000);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F1D14] bg-gradient-to-br from-[#0F1D14] via-[#0F1D14] to-[#0F1D14]">
        <DashboardHeader
          user={{
            id: "loading",
            name: "Loading...",
            role: "Loading...",
            avatar: "—",
          }}
        />
        <div className="mx-auto max-w-[1200px] px-9 py-8 max-md:px-5">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-[#2A4632]"></div>
            <div className="grid grid-cols-[1.65fr_1fr] gap-5">
              <div className="h-96 rounded bg-[#2A4632]"></div>
              <div className="h-96 rounded bg-[#2A4632]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-[#0F1D14] bg-gradient-to-br from-[#0F1D14] via-[#0F1D14] to-[#0F1D14]">
        <DashboardHeader
          user={{
            id: "error",
            name: "Error",
            role: "Unable to load",
            avatar: "!",
          }}
        />
        <div className="mx-auto max-w-[1200px] px-9 py-8 max-md:px-5">
          <div className="rounded-lg border border-[#C0392B] bg-[rgba(192,57,43,0.1)] p-6">
            <h2 className="mb-2 text-lg font-semibold text-[#E8756A]">
              Unable to Load Dashboard
            </h2>
            <p className="text-[#93A490]">
              {error || "An unknown error occurred. Please refresh the page."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1D14] bg-gradient-to-br from-[#0F1D14] via-[#0F1D14] to-[#0F1D14] pb-[60px]">
      <style>{`
        @keyframes gr-pulse {
          0% { box-shadow: 0 0 0 0 rgba(92, 151, 100, 0.45); }
          70% { box-shadow: 0 0 0 7px rgba(92, 151, 100, 0); }
          100% { box-shadow: 0 0 0 0 rgba(92, 151, 100, 0); }
        }
        .animate-gr-pulse {
          animation: gr-pulse 2.2s infinite;
        }
      `}</style>

      {/* Header */}
      <DashboardHeader
        user={dashboard.user}
        onNotificationClick={() => console.log("Notifications")}
        onSettingsClick={() => console.log("Settings")}
        onProfileClick={() => console.log("Profile")}
      />

      {/* SOS Button */}
      <SOSButton state={sosState} onTap={handleSOS} />

      {/* Main Content */}
      <div className="mx-auto max-w-[1200px] px-9 py-8 max-md:px-5">
        {/* Location Row */}
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2.5">
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight text-[#EAE7DA]">
              Good morning, {dashboard.user.name.split(" ")[0]}
            </h1>
            <div className="mt-1 text-[13px] text-[#93A490]">
              📍 {dashboard.location.name} — {dashboard.location.region}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-[#6C7D6A]">
            <span className="h-[7px] w-[7px] rounded-full bg-[#5C9764] animate-gr-pulse"></span>
            Live — synced {dashboard.lastSyncMinutesAgo} min ago
          </div>
        </div>

        {/* Risk & Weather Grid */}
        <div className="mb-5 grid grid-cols-[1.65fr_1fr] gap-5 max-lg:grid-cols-1">
          <RiskSummary data={dashboard.risk} isLoading={isLoading} />
          <WeatherSnapshot data={dashboard.weather} isLoading={isLoading} />
        </div>

        {/* Incident Report Form */}
        <IncidentReportForm
          disasterTypes={mockDisasterTypes}
          onSubmit={handleIncidentSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
