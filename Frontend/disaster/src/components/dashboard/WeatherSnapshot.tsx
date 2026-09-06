import type { Weather } from "../../@types/interface/dashboard";

interface WeatherSnapshotProps {
  data: Weather;
  isLoading?: boolean;
}

export function WeatherSnapshot({ data, isLoading }: WeatherSnapshotProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#102419]/85 p-6 animate-pulse shadow-xl backdrop-blur-md">
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
    <div className="rounded-2xl border border-white/10 bg-[#102419]/85 p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D9A441]">
            Weather Conditions
          </div>
          <div className="mt-1 text-[13px] font-medium text-[#B7CBB2]">
            {data.location} · {data.currentDay}
          </div>
        </div>
        <div className="text-[32px] drop-shadow-md">{data.conditionIcon}</div>
      </div>

      {/* Temperature */}
      <div className="mb-1 text-[48px] font-bold leading-none tracking-tight text-[#F4EFE4] sm:text-[54px]">
        {data.temperature}°
      </div>
      <div className="mb-5 flex items-center gap-2 text-[13px] font-medium text-[#B7CBB2]">
        <span>{data.conditionIcon}</span>
        <span>{data.condition}</span>
      </div>

      {/* Weather Stats */}
      <div className="mb-5 grid grid-cols-3 gap-2.5">
        <div className="rounded-xl border border-white/10 bg-[#173123]/80 p-3 text-center shadow-sm">
          <div className="font-mono text-[16px] font-bold text-[#F4EFE4]">
            {data.stats.rainfall}
          </div>
          <div className="mt-1 text-[11px] font-medium text-[#8AA68F]">Rainfall</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#173123]/80 p-3 text-center shadow-sm">
          <div className="font-mono text-[16px] font-bold text-[#F4EFE4]">
            {data.stats.humidity}
          </div>
          <div className="mt-1 text-[11px] font-medium text-[#8AA68F]">Humidity</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#173123]/80 p-3 text-center shadow-sm">
          <div className="font-mono text-[16px] font-bold text-[#F4EFE4]">
            {data.stats.windGust}
          </div>
          <div className="mt-1 text-[11px] font-medium text-[#8AA68F]">Wind gust</div>
        </div>
      </div>

      {/* Storm Alert */}
      {data.stormAlert && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-[#D9A441]/40 bg-[#D9A441]/10 px-3.5 py-3 text-[12px] font-medium text-[#F2C14E] shadow-sm">
          <span className="text-base">⚠</span>
          <span>{data.stormAlert}</span>
        </div>
      )}

      {/* Forecast */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex justify-between gap-1">
          {data.forecast.map((day) => (
            <div key={day.day} className="flex-1 rounded-lg bg-[#173123]/40 p-2 text-center transition hover:bg-[#173123]">
              <div className="mb-1 text-[11px] font-medium text-[#8AA68F]">{day.day}</div>
              <div className="text-[18px] my-1">{day.icon}</div>
              <div className="text-[11px] font-semibold text-[#F4EFE4] font-mono">
                {day.temps}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
