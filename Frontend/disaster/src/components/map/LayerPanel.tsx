import type { LayerKey, LayerState } from "../../interfaces/map.interface";

interface LayerConfig {
  key: LayerKey;
  label: string;
  icon: string;
  description: string;
}

const LAYERS: LayerConfig[] = [
  { key: "heatmap", label: "Risk Heatmap & AI Zones", icon: "⛰", description: "ML-predicted landslide risk zones" },
  { key: "rainfall", label: "Precipitation (24h)", icon: "🌧", description: "Live rainfall telemetry & alerts" },
  { key: "soilMoisture", label: "Soil Moisture", icon: "💧", description: "Saturation index across terrain" },
  { key: "slope", label: "Slope Gradient", icon: "📐", description: "Topographic incline hazard" },
  { key: "roads", label: "Strategic Highways", icon: "🛣", description: "NH-10 & critical transport corridors" },
  { key: "villages", label: "Habitations & Villages", icon: "🏘", description: "Settlements & population at risk" },
  { key: "hospitals", label: "Medical Response", icon: "🏥", description: "Emergency triage facilities" },
  { key: "sensors", label: "IoT Geotechnical Sensors", icon: "📡", description: "Tiltmeters, piezometers & InSAR" },
  { key: "satellite", label: "Satellite Imagery", icon: "🛰", description: "High-resolution satellite basemap" },
];

interface LayerPanelProps {
  layers: LayerState;
  open: boolean;
  onToggle: (key: LayerKey) => void;
  onClose: () => void;
}

export function LayerPanel({ layers, open, onToggle, onClose }: LayerPanelProps) {
  const activeCount = Object.values(layers).filter(Boolean).length;

  return (
    <div className={`layer-panel${open ? " open" : ""}`}>
      <div className="layer-panel__header">
        <div className="flex items-center gap-2">
          <span>GIS Layers</span>
          <span className="text-[11px] font-semibold bg-[#38e07b]/20 text-[#38e07b] px-2 py-0.5 rounded-full">
            {activeCount} Active
          </span>
        </div>
        <button className="layer-panel__close" onClick={onClose} aria-label="Close layers panel">
          ×
        </button>
      </div>
      <div className="layer-panel__list">
        {LAYERS.map(({ key, label, icon }) => (
          <label key={key} className="layer-toggle flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-base">{icon}</span>
              <span className="font-medium text-[13px]">{label}</span>
            </div>
            <input
              type="checkbox"
              checked={layers[key]}
              onChange={() => onToggle(key)}
              aria-label={`Toggle ${label}`}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
