import { House, MapPin, Users } from "lucide-react";
import type { Village } from "../../@types/interface/emergencyResponse";

interface VillageCardsProps {
  villages: Village[];
}

export function VillageCards({ villages }: VillageCardsProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#102419]/85 p-5 shadow-2xl backdrop-blur-md lg:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9a441]">Community status</p>
        <h2 className="mt-1 text-xl font-semibold text-[#f4efe4]">Affected villages</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {villages.map((village) => (
          <article key={village.id} className="rounded-xl border border-white/10 bg-[#173123]/80 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-[#f4efe4]">{village.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-[#8aa68f]"><MapPin size={12} /> {village.distance ?? "Distance unavailable"}</p>
              </div>
              <House size={18} className="text-[#d9a441]" />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-[#b7cbb2]">
              <span className="flex items-center gap-1"><Users size={13} /> {village.affected} affected</span>
              <span>{village.capacity} capacity</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-[#0d1c13]">
              <div className="h-full rounded-full bg-[#d9a441]" style={{ width: `${village.progress}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {village.needs.map((need) => <span key={need} className="rounded-full bg-[#d9a441]/10 px-2 py-1 text-[10px] text-[#f0c77d]">{need}</span>)}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
