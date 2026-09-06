import type { LayerKey, LayerState } from "../../interfaces/map.interface";

const LAYERS: Array<[LayerKey, string]> = [["heatmap", "Risk Heatmap"], ["rainfall", "Rainfall"], ["soilMoisture", "Soil Moisture"], ["slope", "Slope"], ["roads", "Roads"], ["villages", "Villages"], ["hospitals", "Hospitals"], ["sensors", "Sensors"], ["satellite", "Satellite"]];

interface LayerPanelProps {
  layers: LayerState;
  open: boolean;
  onToggle: (key: LayerKey) => void;
  onClose: () => void;
}

export function LayerPanel({ layers, open, onToggle, onClose }: LayerPanelProps) {
  return <div className={`layer-panel${open ? " open" : ""}`}>
    <div className="layer-panel__header"><span>Layers</span><button className="layer-panel__close" onClick={onClose} aria-label="Close layers panel">×</button></div>
    <div className="layer-panel__list">{LAYERS.map(([key, label]) => <label key={key} className="layer-toggle"><input type="checkbox" checked={layers[key]} onChange={() => onToggle(key)} />{label}</label>)}</div>
  </div>;
}
