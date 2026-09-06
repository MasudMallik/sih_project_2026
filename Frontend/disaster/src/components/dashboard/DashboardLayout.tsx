import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import { Bot, Cross, LayoutDashboard, MapPinned } from "lucide-react";
import { DashboardHeader } from "./DashboardHeader";
import type { User } from "../../@types/interface/dashboard";
import styles from "./DashboardLayout.module.css";

interface DashboardLayoutProps {
  user: User;
  email?: string;
  onProfileClick?: () => void;
  children: ReactNode;
}

const SIDEBAR_NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Risk Map", path: "/risk-map", icon: MapPinned },
  { label: "Emergency Response", path: "/emergency-response", icon: Cross },
  { label: "AI Assistant", path: "/ai-analysis", icon: Bot },
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
    <div className={styles.shell}>
      {/* Slim top header — nav hidden here, shown in sidebar instead */}
      <DashboardHeader
        user={user}
        email={email}
        hideNav
        onProfileClick={onProfileClick}
      />

      <div className={`${styles.contentLayer} flex min-h-[calc(100vh-60px)]`}>
        {/* Sidebar — desktop only; mobile falls back to header's mobile nav */}
        <aside className={`${styles.sidebar} hidden shrink-0 flex-col border-r border-[#223B29] md:flex`}>
          <nav className="sticky top-[60px] flex flex-col items-center gap-2 px-3 py-5" aria-label="Dashboard navigation">
            {SIDEBAR_NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`${styles.navButton} ${isActive ? styles.navButtonActive : ""}`}
                  aria-label={item.label}
                  title={item.label}
                >
                  <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
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
