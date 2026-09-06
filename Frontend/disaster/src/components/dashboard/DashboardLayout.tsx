import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import { DashboardHeader } from "./DashboardHeader";
import type { User } from "../../@types/interface/dashboard";

interface DashboardLayoutProps {
  user: User;
  email?: string;
  onProfileClick?: () => void;
  children: ReactNode;
}

const SIDEBAR_NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Risk Map", path: "/risk-map" },
  { label: "Emergency Response", path: "/emergency-response" },
  { label: "AI Assistant", path: "/ai-analysis" },
];

export function DashboardLayout({
  user,
  email,
  onProfileClick,
  children,
}: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F1D14]">
      {/* Slim top header — nav hidden here, shown in sidebar instead */}
      <DashboardHeader
        user={user}
        email={email}
        hideNav
        onProfileClick={onProfileClick}
      />

      <div className="flex min-h-[calc(100vh-60px)]">
        {/* Sidebar — desktop only; mobile falls back to header's mobile nav */}
        <aside className="hidden md:flex w-[220px] shrink-0 flex-col border-r border-[#223B29] bg-[#0B1610]">
          <nav className="sticky top-[60px] flex flex-col gap-1 px-3 py-5">
            {SIDEBAR_NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`rounded-md px-3.5 py-2.5 text-[13px] font-medium text-left transition-all ${
                    isActive
                      ? "border border-[#E3A63F]/40 bg-[#16281C] text-[#E3A63F] shadow-sm"
                      : "border border-transparent text-[#93A490] hover:bg-[#16281C]/50 hover:text-[#EAE7DA]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
