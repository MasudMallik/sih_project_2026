import { useLocation, useNavigate } from "react-router";
import type { User } from "../../@types/interface/dashboard";

interface DashboardHeaderProps {
  user: User;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
}

const DASHBOARD_NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Risk Map", path: "/risk-map" },
  { label: "Emergency Response", path: "/emergency-response" },
  { label: "AI Assistant", path: "/ai-analysis" },
  { label: "Profile", path: "/profile" },
];

export function DashboardHeader({
  user,
  onNotificationClick,
  onProfileClick,
}: DashboardHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-[#223B29] bg-[rgba(15,29,20,0.85)] backdrop-blur-sm">
      <div className="flex items-center justify-between px-9 py-[14px] max-md:px-5 max-md:py-3">
        {/* Brand */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="h-[30px] w-[30px] rounded-full bg-gradient-to-br from-[#D9A441] to-[#E08A3E] shadow-lg shadow-[#E08A3E]/15"></div>
          <div>
            <div className="text-[18px] font-semibold tracking-tight text-[#EAE7DA]">
              Geo Rakshak
            </div>
            <div className="text-[11px] text-[#6C7D6A]">
              Disaster Response Dashboard
            </div>
          </div>
        </button>

        {/* Dashboard Navigation Bar */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Dashboard navigation">
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "border border-[#E3A63F]/40 bg-[#16281C] text-[#E3A63F] shadow-sm"
                    : "text-[#93A490] hover:bg-[#16281C]/50 hover:text-[#EAE7DA]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-[18px]">
          {/* Notifications */}
          <button
            type="button"
            onClick={onNotificationClick}
            className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#2A4632] bg-[#16281C] text-lg text-[#93A490] transition-colors hover:border-[#E08A3E] hover:text-[#E08A3E]"
            title="Notifications"
          >
            🔔
            <span className="absolute top-[-2px] right-[-2px] h-[9px] w-[9px] rounded-full border-2 border-[#0F1D14] bg-[#C0392B]"></span>
          </button>

          {/* Profile */}
          <button
            type="button"
            onClick={onProfileClick || (() => navigate("/profile"))}
            className="flex items-center gap-2.5 rounded-full border border-[#2A4632] bg-[#16281C] px-3 py-1.5 transition-colors hover:border-[#E08A3E]"
            title="Profile"
          >
            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-gradient-to-br from-[#5C9764] to-[#2F5A38] font-semibold text-[13px] text-[#EAE7DA]">
              {user.avatar}
            </div>
            <div className="max-md:hidden">
              <div className="text-[13px] font-medium text-[#EAE7DA]">
                {user.name}
              </div>
              <div className="text-[10px] text-[#6C7D6A]">{user.role}</div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="flex overflow-x-auto border-t border-[#223B29]/60 px-4 py-2 md:hidden">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`mr-2 shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                isActive
                  ? "bg-[#16281C] text-[#E3A63F]"
                  : "text-[#93A490]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}

