import type { Weather } from "../../@types/interface/dashboard";

interface WeatherSnapshotProps {
  data: Weather;
  isLoading?: boolean;
}

export function WeatherSnapshot({ data, isLoading }: WeatherSnapshotProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#223B29] bg-[#16281C] p-6 animate-pulse">
        <div className="mb-4 h-4 w-24 rounded bg-[#2A4632]"></div>
        <div className="mb-4 h-16 w-20 rounded bg-[#2A4632]"></div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded bg-[#2A4632]"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#223B29] bg-[#16281C] p-6">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-[13px] text-[#93A490]">{data.location}</div>
          <div className="text-[11px] text-[#6C7D6A]">{data.currentDay}</div>
        </div>
        <div className="text-[28px]">{data.conditionIcon}</div>
      </div>

      {/* Temperature */}
      <div className="mb-1 text-[52px] font-bold leading-none text-[#EAE7DA]">
        {data.temperature}°
      </div>
      <div className="mb-5 flex items-center gap-2 text-[13px] text-[#93A490]">
        {data.conditionIcon} {data.condition}
      </div>

      {/* Weather Stats */}
      <div className="mb-5 grid grid-cols-3 gap-2">
        <div className="rounded border border-[#223B29] bg-[#1D3423] p-2.5 text-center">
          <div className="font-mono text-[16px] font-bold text-[#EAE7DA]">
            {data.stats.rainfall}
          </div>
          <div className="text-[10px] text-[#6C7D6A]">Rainfall</div>
        </div>
        <div className="rounded border border-[#223B29] bg-[#1D3423] p-2.5 text-center">
          <div className="font-mono text-[16px] font-bold text-[#EAE7DA]">
            {data.stats.humidity}
          </div>
          <div className="text-[10px] text-[#6C7D6A]">Humidity</div>
        </div>
        <div className="rounded border border-[#223B29] bg-[#1D3423] p-2.5 text-center">
          <div className="font-mono text-[16px] font-bold text-[#EAE7DA]">
            {data.stats.windGust}
          </div>
          <div className="text-[10px] text-[#6C7D6A]">Wind gust</div>
        </div>
      </div>

      {/* Storm Alert */}
      {data.stormAlert && (
        <div className="mb-5 flex items-center gap-2.5 rounded border border-[rgba(217,164,65,0.3)] bg-[rgba(217,164,65,0.1)] px-3 py-2.5 text-[12px] text-[#D9A441]">
          <span className="text-lg">⚠</span>
          {data.stormAlert}
        </div>
      )}

      {/* Forecast */}
      <div className="border-t border-[#223B29] pt-4">
        <div className="flex justify-between">
          {data.forecast.map((day) => (
            <div key={day.day} className="text-center">
              <div className="mb-1.5 text-[11px] text-[#93A490]">{day.day}</div>
              <div className="text-[14px]">{day.icon}</div>
              <div className="mt-1.5 text-[12px] font-medium text-[#EAE7DA]">
                {day.temps}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
