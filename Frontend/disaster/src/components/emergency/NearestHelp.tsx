import { HeartPulse, Hospital, MapPin, Phone, ShieldCheck, Utensils } from "lucide-react";
import type { HelpEntry } from "../../@types/interface/emergencyResponse";

interface NearestHelpProps {
  entries: HelpEntry[];
}

export function NearestHelp({ entries }: NearestHelpProps) {
  const iconMap = { "Medical": HeartPulse, "Shelter": Hospital, "Food & Water": Utensils, "Rescue": ShieldCheck };

  return (
    <section className="rounded-2xl border border-white/10 bg-[#102419]/85 p-5 shadow-2xl backdrop-blur-md lg:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9a441]">Response network</p>
        <h2 className="mt-1 text-xl font-semibold text-[#f4efe4]">Nearest help</h2>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => {
          const Icon = iconMap[entry.category];
          return (
            <div key={entry.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#173123]/80 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#d9a441]/10 text-[#f0c77d]"><Icon size={19} /></div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#8aa68f]">{entry.category}</p>
                <h3 className="truncate text-sm font-semibold text-[#f4efe4]">{entry.title}</h3>
                <p className="text-xs text-[#b7cbb2]">{entry.availability}</p>
                {(entry.location || entry.distance) && <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#8aa68f]"><MapPin size={12} /> {entry.location ?? "Location unavailable"}{entry.distance && <span>{entry.distance}</span>}</p>}
              </div>
              <a href={`tel:${entry.contact.replace(/[^0-9+]/g, "")}`} aria-label={`Call ${entry.title}`} className="rounded-full border border-white/10 p-2 text-[#d9a441] transition hover:border-[#d9a441]"><Phone size={15} /></a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
