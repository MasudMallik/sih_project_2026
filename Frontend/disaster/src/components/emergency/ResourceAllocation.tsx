import { Package, Truck } from "lucide-react";
import type { Resource } from "../../@types/interface/emergencyResponse";

interface ResourceAllocationProps {
  resources: Resource[];
}

export function ResourceAllocation({ resources }: ResourceAllocationProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#102419]/85 p-5 shadow-2xl backdrop-blur-md lg:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-lg bg-[#d9a441]/10 p-2 text-[#f0c77d]"><Package size={18} /></div>
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9a441]">Logistics</p><h2 className="mt-1 text-xl font-semibold text-[#f4efe4]">Resource allocation</h2></div>
      </div>
      <div className="space-y-4">
        {resources.map((resource) => {
          const percentage = Math.min(100, Math.round((resource.allocated / resource.total) * 100));
          return (
            <div key={resource.id}>
              <div className="mb-1.5 flex items-center justify-between text-xs"><span className="flex items-center gap-2 text-[#c6d5c3]"><Truck size={13} className="text-[#d9a441]" /> {resource.name}</span><span className="text-[#f0c77d]">{resource.allocated}/{resource.total} {resource.unit}</span></div>
              <div className="h-2 rounded-full bg-[#0d1c13]"><div className="h-full rounded-full bg-gradient-to-r from-[#5c9764] to-[#d9a441]" style={{ width: `${percentage}%` }} /></div>
              <p className="mt-1 text-right text-[10px] text-[#6f8b75]">{percentage}% allocated</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
