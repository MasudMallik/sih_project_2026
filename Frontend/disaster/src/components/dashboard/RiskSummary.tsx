import type { RiskSummary as RiskSummaryType } from "../../@types/interface/dashboard";

interface RiskSummaryProps {
  data: RiskSummaryType;
  isLoading?: boolean;
}

const riskColors: Record<
  string,
  { hex: string; bg: string; text: string; border: string }
> = {
  low: {
    hex: "#4CAF6D",
    bg: "bg-[#4CAF6D]/15",
    text: "text-[#4CAF6D]",
    border: "border-[#4CAF6D]/40",
  },
  moderate: {
    hex: "#F2C14E",
    bg: "bg-[#F2C14E]/15",
    text: "text-[#F2C14E]",
    border: "border-[#F2C14E]/40",
  },
  high: {
    hex: "#EF8A3D",
    bg: "bg-[#EF8A3D]/15",
    text: "text-[#EF8A3D]",
    border: "border-[#EF8A3D]/40",
  },
  critical: {
    hex: "#E14B3C",
    bg: "bg-[#E14B3C]/15",
    text: "text-[#E14B3C]",
    border: "border-[#E14B3C]/40",
  },
};

export function RiskSummary({ data, isLoading }: RiskSummaryProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#102419]/85 p-6 animate-pulse shadow-xl backdrop-blur-md">
        <div className="mb-4 h-4 w-32 rounded bg-[#2A4632]"></div>
        <div className="mb-4 h-12 w-24 rounded bg-[#2A4632]"></div>
        <div className="grid grid-cols-4 gap-2.5 max-md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-[#2A4632]"></div>
          ))}
        </div>
      </div>
    );
  }

  const rawLevel = (data?.currentLevel || "").toLowerCase();
  const safeLevel = (rawLevel && riskColors[rawLevel]) ? rawLevel : "moderate";
  const currentRiskColor = riskColors[safeLevel];

  const safeCounts = Array.isArray(data?.counts) ? data.counts : [];
  const safeZones = Array.isArray(data?.zones) ? data.zones : [];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#102419]/85 p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D9A441]">
          Live Risk Summary
        </div>
        <div className="rounded-full border border-white/10 bg-[#173123]/80 px-2.5 py-1 text-xs font-medium text-[#B7CBB2]">
          {data?.zoneCount ?? safeZones.length} monitored zones
        </div>
      </div>

      {/* Current Risk */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1 text-xs text-[#8AA68F]">
            Current area status
          </div>
          <div
            className="text-[38px] font-bold leading-none tracking-tight sm:text-[44px]"
            style={{ color: currentRiskColor.hex }}
          >
            {safeLevel.charAt(0).toUpperCase() + safeLevel.slice(1)}
          </div>
        </div>
        <div
          className="flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-sm"
          style={{
            backgroundColor: `${currentRiskColor.hex}18`,
            borderColor: `${currentRiskColor.hex}44`,
            color: currentRiskColor.hex,
          }}
        >
          <span
            className="h-2 w-2 rounded-full animate-pulse"
            style={{ backgroundColor: currentRiskColor.hex }}
          />
          {data?.message || "Monitoring live risk metrics"}
        </div>
      </div>

      {/* Risk Counts Cards */}
      <div className="mb-6 grid grid-cols-4 gap-2.5 max-md:grid-cols-2">
        {safeCounts.map((count) => {
          const levelKey = (count?.level || "").toLowerCase();
          const color = (levelKey && riskColors[levelKey]) ? riskColors[levelKey] : riskColors.moderate;
          return (
            <div
              key={count.level}
              className="rounded-xl border border-white/10 bg-[#173123]/80 p-3.5 transition-all duration-200 hover:border-white/20 hover:bg-[#1C3A29] shadow-sm"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-[12px] font-medium text-[#B7CBB2]">
                  {count.label}
                </span>
              </div>
              <div
                className="font-mono text-[28px] font-bold leading-none tracking-tight"
                style={{ color: color.hex }}
              >
                {count.count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk Zones List */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8AA68F]">
          Sector breakdown
        </div>
        {safeZones.map((zone) => {
          const zoneLevelKey = (zone?.level || "").toLowerCase();
          const zoneColor = (zoneLevelKey && riskColors[zoneLevelKey]) ? riskColors[zoneLevelKey] : riskColors.moderate;
          return (
            <div
              key={zone.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-[#173123]/70 px-3.5 py-3 transition hover:border-[#D9A441]/30 hover:bg-[#1C3A29]"
            >
              <div className="flex items-center gap-3">
                <span
                  className="rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${zoneColor.hex}22`,
                    borderColor: `${zoneColor.hex}44`,
                    color: zoneColor.hex,
                  }}
                >
                  {zone.label}
                </span>
                <span className="text-[13px] font-medium text-[#F4EFE4]">{zone.name}</span>
              </div>
              <span className="text-[12px] text-[#8AA68F] font-mono">{zone.distance}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
