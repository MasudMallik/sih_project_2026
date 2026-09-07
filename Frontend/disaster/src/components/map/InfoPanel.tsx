import type { Hospital, MapSelection, RiskZone, Road, Sensor, Village } from "../../interfaces/map.interface";
import { riskColor } from "../../validation/map.validation";

interface InfoPanelProps {
  selection: MapSelection;
  onClose: () => void;
}

export function InfoPanel({ selection, onClose }: InfoPanelProps) {
  const { kind, data } = selection;
  const label =
    kind === "village"
      ? "Habitation & Settlement"
      : kind === "hospital"
      ? "Medical Emergency Center"
      : kind === "road"
      ? "Highway / Corridor"
      : kind === "sensor"
      ? "IoT Geotechnical Sensor"
      : "Monitored Risk Sector";

  const zone = data as RiskZone;
  const road = data as Road;
  const village = data as Village;
  const hospital = data as Hospital;
  const sensor = data as Sensor;

  return (
    <div className="info-panel" role="region" aria-label="Entity Details">
      <button className="info-panel__close" onClick={onClose} aria-label="Close details panel">
        ×
      </button>

      <div className="info-panel__body">
        {kind === "zone" ? (
          <>
            <div className="info-panel__eyebrow">Sector: {zone.district ?? "Monitored Region"}</div>
            <div className="info-panel__title-row">
              <span className="info-panel__label">{zone.name}</span>
              <span className="risk-badge" style={{ background: riskColor(zone.riskLevel) }}>
                {(zone.riskLevel ?? "Unknown").toUpperCase()}
              </span>
            </div>

            {/* Risk Assessment Indicator */}
            <div className="mb-3.5 p-2.5 rounded-lg bg-black/30 border border-white/5">
              <div className="flex justify-between text-[11.5px] mb-1 text-[#9fb3a0]">
                <span>Hazard Severity</span>
                <strong style={{ color: riskColor(zone.riskLevel) }}>
                  {(zone.riskLevel ?? "Low").toUpperCase()} RISK
                </strong>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: zone.riskLevel === "Critical" ? "100%" : zone.riskLevel === "High" ? "75%" : zone.riskLevel === "Medium" ? "50%" : "25%",
                    background: riskColor(zone.riskLevel),
                  }}
                />
              </div>
            </div>

            {[
              ["Rainfall (24h)", zone.rainfall24h !== undefined ? `${zone.rainfall24h} mm` : undefined],
              ["Soil Saturation", zone.soilMoisture !== undefined ? `${zone.soilMoisture}%` : undefined],
              ["Slope Angle", zone.slope !== undefined ? `${zone.slope}°` : undefined],
              ["Historical Landslides", zone.prevLandslides !== undefined ? `${zone.prevLandslides} events` : undefined],
              ["Last Incident", zone.lastIncident],
            ].map(([name, value]) => (
              <div className="info-stat" key={name}>
                <span className="info-stat__label">{name}</span>
                <span className="info-stat__value">{value ?? "N/A"}</span>
              </div>
            ))}

            {zone.recommendedAction && (
              <div className="info-panel__action">
                <div className="info-panel__action-label">AI Action Directive:</div>
                <div className="info-panel__action-text">{zone.recommendedAction}</div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="info-panel__eyebrow">{label}</div>
            <div className="info-panel__title-row">
              <span className="info-panel__label">{data.name}</span>
            </div>

            {kind === "road" && (
              <>
                <Stat
                  label="Status / Risk"
                  value={road.riskLevel ?? "Normal"}
                  color={riskColor(road.riskLevel)}
                />
                <Stat label="Type" value="National / Strategic Highway" />
              </>
            )}

            {kind === "village" && (
              <>
                <Stat label="Population" value={village.population?.toLocaleString() ?? "Unavailable"} />
                <Stat
                  label="Vulnerability Status"
                  value={village.riskLevel ?? "Monitored"}
                  color={riskColor(village.riskLevel)}
                />
                <Stat label="Evacuation Protocol" value="Designated Safe Shelters Active" />
              </>
            )}

            {kind === "hospital" && (
              <>
                <Stat label="Emergency Bed Capacity" value={hospital.beds?.toLocaleString() ?? "Unavailable"} />
                <Stat label="Trauma Unit" value="Operational 24/7" color="#38e07b" />
                <Stat label="Ambulance Dispatch" value="Standby Ready" />
              </>
            )}

            {kind === "sensor" && (
              <>
                <Stat
                  label="Operational Status"
                  value={sensor.status ?? "Active"}
                  color={sensor.status === "Active" ? "#38e07b" : "#ef4444"}
                />
                <Stat label="Live Telemetry" value={sensor.reading ?? "Telemetry Nominal"} />
                <Stat label="Telemetry Frequency" value="Every 30 seconds" />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="info-stat">
      <span className="info-stat__label">{label}</span>
      <span className="info-stat__value" style={color ? { color } : undefined}>
        {value}
      </span>
    </div>
  );
}
