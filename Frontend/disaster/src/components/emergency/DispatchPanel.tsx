import { Radio, Send, ShieldAlert, Truck } from "lucide-react";

interface DispatchPanelProps {
  isDispatching: boolean;
  onDispatch: () => void;
  onBroadcast: () => void;
}

export function DispatchPanel({ isDispatching, onDispatch, onBroadcast }: DispatchPanelProps) {
  return (
    <section className="rounded-2xl border border-[#d9a441]/30 bg-[#1d3423]/90 p-5 shadow-2xl backdrop-blur-md lg:p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-[#c0392b]/15 p-2 text-[#f0a69e]"><ShieldAlert size={20} /></div>
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9a441]">Command action</p><h2 className="mt-1 text-xl font-semibold text-[#f4efe4]">Emergency dispatch</h2><p className="mt-2 text-sm leading-6 text-[#b7cbb2]">Coordinate the nearest response team and broadcast a verified alert to affected communities.</p></div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={onDispatch} disabled={isDispatching} className="flex items-center justify-center gap-2 rounded-lg bg-[#c0392b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#d64e3d] disabled:cursor-wait disabled:opacity-60"><Truck size={16} /> {isDispatching ? "Dispatching..." : "Dispatch team"}</button>
        <button type="button" onClick={onBroadcast} className="flex items-center justify-center gap-2 rounded-lg border border-[#d9a441]/60 px-4 py-3 text-sm font-semibold text-[#f0c77d] transition hover:bg-[#d9a441]/10"><Radio size={16} /> Broadcast alert <Send size={14} /></button>
      </div>
    </section>
  );
}
