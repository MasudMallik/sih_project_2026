import { AlertTriangle, CheckCircle2, Clock3, MapPin } from "lucide-react";
import type { Incident } from "../../@types/interface/emergencyResponse";

interface IncidentListProps {
  incidents: Incident[];
  sortDescending: boolean;
  onToggleSort: () => void;
}

const severityStyles: Record<Incident["severityLabel"], string> = {
  Critical: "border-red-400/30 bg-red-500/10 text-red-200",
  High: "border-orange-400/30 bg-orange-500/10 text-orange-200",
  Moderate: "border-amber-400/30 bg-amber-500/10 text-amber-200",
};

const statusStyles: Record<Incident["status"], string> = {
  Active: "text-red-200",
  Monitoring: "text-amber-200",
  Resolved: "text-emerald-200",
};

export function IncidentList({ incidents, sortDescending, onToggleSort }: IncidentListProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#102419]/85 p-5 shadow-2xl backdrop-blur-md lg:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9a441]">Live operations</p>
          <h2 className="mt-1 text-xl font-semibold text-[#f4efe4]">Incident board</h2>
        </div>
        <button
          type="button"
          onClick={onToggleSort}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-[#b7cbb2] transition hover:border-[#d9a441]/70 hover:text-[#f4efe4]"
        >
          Severity {sortDescending ? "high to low" : "low to high"}
          <Clock3 size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {incidents.map((incident) => (
          <article key={incident.id} className="rounded-xl border border-white/10 bg-[#173123]/80 p-4 transition hover:border-[#d9a441]/40">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-[#f4efe4]">{incident.name}</h3>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${severityStyles[incident.severityLabel]}`}>
                    {incident.severityLabel}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-[#8aa68f]">
                  <MapPin size={13} /> {incident.location}
                </div>
              </div>
              <span className={`flex items-center gap-1.5 text-xs font-medium ${statusStyles[incident.status]}`}>
                {incident.status === "Active" ? <AlertTriangle size={14} /> : incident.status === "Resolved" ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
                {incident.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#c6d5c3]">{incident.detail}</p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-[#6f8b75]">
              <span>Severity index {incident.severity}%</span>
              <span>{incident.updatedAt}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#0d1c13]">
              <div className="h-full rounded-full bg-gradient-to-r from-[#d9a441] to-[#c0392b]" style={{ width: `${incident.severity}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
