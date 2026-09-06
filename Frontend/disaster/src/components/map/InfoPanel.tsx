import type { Hospital, MapSelection, RiskZone, Road, Sensor, Village } from "../../interfaces/map.interface";
import { riskColor } from "../../validation/map.validation";

interface InfoPanelProps { selection: MapSelection; onClose: () => void; }

export function InfoPanel({ selection, onClose }: InfoPanelProps) {
  const { kind, data } = selection;
  const label = kind === "village" ? "Village" : kind === "hospital" ? "Hospital" : kind === "road" ? "Road" : kind === "sensor" ? "Sensor" : "Location";
  const zone = data as RiskZone;
  const road = data as Road;
  const village = data as Village;
  const hospital = data as Hospital;
  const sensor = data as Sensor;
  return <div className="info-panel">
    <button className="info-panel__close" onClick={onClose} aria-label="Close details panel">×</button>
    <div className="info-panel__body">
      {kind === "zone" ? <>
        <div className="info-panel__eyebrow">Location: {zone.district ?? "Unavailable"}</div>
        <div className="info-panel__title-row"><span className="info-panel__label">Risk Level:</span><span className="risk-badge" style={{ background: riskColor(zone.riskLevel) }}>{(zone.riskLevel ?? "Unknown").toUpperCase()}</span></div>
        {[ ["Rainfall (24h)", zone.rainfall24h === undefined ? undefined : `${zone.rainfall24h} mm`], ["Soil Moisture", zone.soilMoisture === undefined ? undefined : `${zone.soilMoisture}%`], ["Slope", zone.slope === undefined ? undefined : `${zone.slope}°`], ["Prev. Landslides", zone.prevLandslides], ["AI Risk Probability", zone.aiProbability === undefined ? undefined : `${zone.aiProbability}%`], ["Last Incident", zone.lastIncident] ].map(([name, value]) => <div className="info-stat" key={name}><span className="info-stat__label">{name}</span><span className="info-stat__value">{value ?? "Unavailable"}</span></div>)}
        {zone.recommendedAction && <div className="info-panel__action"><div className="info-panel__action-label">Recommended Action:</div><div className="info-panel__action-text">{zone.recommendedAction}</div></div>}
      </> : <>
        <div className="info-panel__eyebrow">{label}</div><div className="info-panel__title-row"><span className="info-panel__label">{data.name}</span></div>
        {kind === "road" && <Stat label="Risk Level" value={road.riskLevel ?? "Unavailable"} color={riskColor(road.riskLevel)} />}
        {kind === "village" && <><Stat label="Population" value={village.population?.toLocaleString() ?? "Unavailable"} /><Stat label="Risk Level" value={village.riskLevel ?? "Unavailable"} color={riskColor(village.riskLevel)} /></>}
        {kind === "hospital" && <Stat label="Bed Capacity" value={hospital.beds?.toLocaleString() ?? "Unavailable"} />}
        {kind === "sensor" && <><Stat label="Status" value={sensor.status ?? "Unknown"} color={sensor.status === "Active" ? riskColor("Low") : undefined} /><Stat label="Latest Reading" value={sensor.reading ?? "Unavailable"} /></>}
      </>}
    </div>
  </div>;
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) { return <div className="info-stat"><span className="info-stat__label">{label}</span><span className="info-stat__value" style={color ? { color } : undefined}>{value}</span></div>; }
