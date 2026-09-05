import type { RiskSummary as RiskSummaryType } from "../../@types/interface/dashboard";

interface RiskSummaryProps {
  data: RiskSummaryType;
  isLoading?: boolean;
}

const riskColors = {
  low: { bg: "bg-[#5C9764]", text: "text-[#5C9764]", border: "border-[#5C9764]" },
  moderate: { bg: "bg-[#D9A441]", text: "text-[#D9A441]", border: "border-[#D9A441]" },
  high: { bg: "bg-[#DB7C3C]", text: "text-[#DB7C3C]", border: "border-[#DB7C3C]" },
  critical: { bg: "bg-[#C0392B]", text: "text-[#C0392B]", border: "border-[#C0392B]" },
};

export function RiskSummary({ data, isLoading }: RiskSummaryProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#223B29] bg-[#16281C] p-6 animate-pulse">
        <div className="mb-4 h-4 w-32 rounded bg-[#2A4632]"></div>
        <div className="mb-4 h-12 w-24 rounded bg-[#2A4632]"></div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded bg-[#2A4632]"></div>
          ))}
        </div>
      </div>
    );
  }

  const currentRiskColor = riskColors[data.currentLevel];

  return (
    <div className="rounded-lg border border-[#223B29] bg-[#16281C] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-[13px] font-medium text-[#93A490]">
          Live Risk Summary
        </div>
        <div className="text-[13px] font-medium text-[#93A490]">
          {data.zoneCount} zones near you
        </div>
      </div>

      {/* Current Risk */}
      <div className="mb-6 flex items-end gap-[18px]">
        <div>
          <div className="mb-1.5 text-[13px] text-[#93A490]">
            Current area status
          </div>
          <div className={`text-[42px] font-bold leading-none ${currentRiskColor.text}`}>
            {data.currentLevel.charAt(0).toUpperCase() + data.currentLevel.slice(1)}
          </div>
        </div>
        <div
          className={`mb-2 flex items-center gap-2 rounded-full border ${currentRiskColor.border} px-3 py-1.5 text-[12px] font-semibold`}
          style={{ backgroundColor: `${currentRiskColor.text}15` }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: currentRiskColor.text }}></span>
          {data.message}
        </div>
      </div>

      {/* Risk Counts */}
      <div className="mb-6 grid grid-cols-4 gap-2.5 max-md:grid-cols-2">
        {data.counts.map((count) => {
          const color = riskColors[count.level];
          return (
            <div
              key={count.level}
              className="rounded border border-[#223B29] bg-[#1D3423] p-3"
            >
              <div className="mb-2 flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-sm"
                  style={{ background: color.text }}
                ></span>
                <span className="text-[11px] text-[#93A490]">{count.label}</span>
              </div>
              <div className="font-mono text-[24px] font-bold leading-none" style={{ color: color.text }}>
                {count.count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk Zones */}
      <div className="space-y-2.5">
        {data.zones.map((zone) => {
          const zoneColor = riskColors[zone.level];
          return (
            <div
              key={zone.id}
              className="flex items-center justify-between rounded border border-[#223B29] bg-[#1D3423] px-3 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="rounded-full px-2 py-1 text-[10px] font-bold tracking-wider"
                  style={{
                    background: `${zoneColor.text}20`,
                    color: zoneColor.text,
                  }}
                >
                  {zone.label}
                </span>
                <span className="text-[13px] text-[#EAE7DA]">{zone.name}</span>
              </div>
              <span className="text-[12px] text-[#6C7D6A]">{zone.distance}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
