import { Activity, Bell, CheckCircle2, Truck } from "lucide-react";
import type { FeedItem } from "../../@types/interface/emergencyResponse";

interface ActivityFeedProps {
  items: FeedItem[];
  isLoading?: boolean;
  error?: string | null;
}

export function ActivityFeed({ items, isLoading = false, error = null }: ActivityFeedProps) {
  const iconMap = { alert: Bell, dispatch: Truck, update: Activity, system: CheckCircle2 };
  return (
    <section className="rounded-2xl border border-white/10 bg-[#102419]/85 p-5 shadow-2xl backdrop-blur-md lg:p-6">
      <div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9a441]">Response network</p><h2 className="mt-1 text-xl font-semibold text-[#f4efe4]">Activity feed</h2></div>
      {isLoading && <p className="text-sm text-[#8aa68f]">Loading response activity...</p>}
      {!isLoading && error && <p className="text-sm text-[#f0a69e]">{error}</p>}
      {!isLoading && !error && items.length === 0 && <p className="text-sm text-[#8aa68f]">No response activity is available yet.</p>}
      {!isLoading && !error && items.length > 0 && <div className="space-y-4">
        {items.map((item) => { const Icon = iconMap[item.type]; return <div key={item.id} className="flex gap-3"><div className="mt-0.5 rounded-full bg-[#d9a441]/10 p-2 text-[#f0c77d]"><Icon size={14} /></div><div><p className="text-sm leading-5 text-[#c6d5c3]">{item.text}</p><p className="mt-1 text-[11px] text-[#6f8b75]">{item.time}</p></div></div>; })}
      </div>}
    </section>
  );
}
