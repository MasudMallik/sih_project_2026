import type { User } from "../../@types/interface/dashboard";

interface DashboardHeaderProps {
  user: User;
  onNotificationClick?: () => void;
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
}

export function DashboardHeader({
  user,
  onNotificationClick,
  onSettingsClick,
  onProfileClick,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#223B29] bg-[rgba(15,29,20,0.85)] backdrop-blur-sm">
      <div className="flex items-center justify-between px-9 py-[18px] max-md:px-5 max-md:py-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="h-[30px] w-[30px] rounded-full bg-gradient-to-br from-[#D9A441] to-[#E08A3E] shadow-lg shadow-[#E08A3E]/15"></div>
          <div>
            <div className="text-[18px] font-semibold tracking-tight text-[#EAE7DA]">
              Geo Rakshak
            </div>
            <div className="text-[11px] text-[#6C7D6A]">
              Disaster Response Dashboard
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-[22px]">
          {/* Notifications */}
          <button
            onClick={onNotificationClick}
            className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#2A4632] bg-[#16281C] text-lg text-[#93A490] transition-colors hover:border-[#E08A3E] hover:text-[#E08A3E]"
            title="Notifications"
          >
            🔔
            <span className="absolute top-[-2px] right-[-2px] h-[9px] w-[9px] rounded-full border-2 border-[#0F1D14] bg-[#C0392B]"></span>
          </button>

          {/* Settings */}
          <button
            onClick={onSettingsClick}
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#2A4632] bg-[#16281C] text-lg text-[#93A490] transition-colors hover:border-[#E08A3E] hover:text-[#E08A3E]"
            title="Settings"
          >
            ⚙
          </button>

          {/* Profile */}
          <button
            onClick={onProfileClick}
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
    </header>
  );
}
