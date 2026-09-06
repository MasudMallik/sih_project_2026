import { useEffect } from "react";
import { useNavigate } from "react-router";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { ProfileSummaryCard } from "../components/profile/ProfileSummaryCard";
import { PersonalInformationCard } from "../components/profile/PersonalInformationCard";
import { AlertAreaCard } from "../components/profile/AlertAreaCard";
import { getCurrentUser, logout } from "../services/auth.service";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Profile() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  // No active session — send them back to log in rather than showing an empty page.
  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-forest-dark pb-16">
      {/* Reused global app header — same one the dashboard uses */}
      <DashboardHeader
        user={{
          id: user.email,
          name: user.name.trim() || user.email,
          // Role isn't collected anywhere in signup today, so it isn't shown
          // in the profile content below — this is just the header's label.
          role: "Citizen",
          avatar: getInitials(user.name || user.email),
        }}
        onNotificationClick={() => console.log("Notifications")}
        onProfileClick={() => navigate("/profile")}
      />

      <div className="mx-auto max-w-[1000px] px-9 py-8 max-md:px-5">
        {/* Page-level header: title + logout, per the reference layout */}
        <div className="mb-6 flex items-center justify-between border-b border-[#223B29] pb-5">
          <h1 className="text-2xl font-semibold tracking-tight text-cream">My Profile</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-[#2A4632] bg-[#16281C] px-4 py-2 text-sm font-medium text-cream transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Logout
          </button>
        </div>

        <div className="space-y-5">
          <ProfileSummaryCard user={user} />
          <PersonalInformationCard user={user} />
          <AlertAreaCard user={user} />
        </div>
      </div>
    </div>
  );
}
