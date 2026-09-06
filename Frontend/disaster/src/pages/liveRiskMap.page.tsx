import { useCallback, useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import "./liveRiskMap.page.css";
import { LayerPanel } from "../components/map/LayerPanel";
import { InfoPanel } from "../components/map/InfoPanel";
import { Legend } from "../components/map/Legend";
import { MapView } from "../components/map/MapView";
import { SearchBar } from "../components/map/SearchBar";
import { useMapData } from "../hooks/useMapData";
import type { LayerKey, LayerState, MapSelection, SearchResult } from "../interfaces/map.interface";

const DEFAULT_LAYERS: LayerState = { heatmap: true, rainfall: false, soilMoisture: false, slope: false, roads: false, villages: false, hospitals: false, sensors: false, satellite: false };

export default function LiveRiskMap() {
  const { data, isLoading, error } = useMapData();
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [selected, setSelected] = useState<MapSelection | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [flyTo, setFlyTo] = useState<SearchResult | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const updatedLabel = useMemo(() => {
    if (!data) return "";
    const seconds = Math.max(0, Math.floor((now - Date.parse(data.receivedAt)) / 1000));
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return minutes < 60 ? `${minutes}m ago` : `${Math.floor(minutes / 60)}h ago`;
  }, [data, now]);

  const searchables = useMemo<SearchResult[]>(() => {
    if (!data) return [];
    return [
      ...data.zones.map((zone) => ({ id: zone.id, name: zone.name, type: zone.type ?? "Risk zone", kind: "zone" as const, coordinate: zone.center })),
      ...data.villages.map((village) => ({ id: village.id, name: village.name, type: "Village", kind: "village" as const, coordinate: village.coordinate })),
      ...data.hospitals.map((hospital) => ({ id: hospital.id, name: hospital.name, type: "Hospital", kind: "hospital" as const, coordinate: hospital.coordinate })),
      ...data.sensors.map((sensor) => ({ id: sensor.id, name: sensor.name, type: "Sensor", kind: "sensor" as const, coordinate: sensor.coordinate })),
      ...data.roads.map((road) => ({ id: road.id, name: road.name, type: "Road", kind: "road" as const })),
    ];
  }, [data]);

  const toggleLayer = useCallback((key: LayerKey) => setLayers((current) => ({ ...current, [key]: !current[key] })), []);
  const handleSelect = useCallback((selection: MapSelection) => setSelected(selection), []);
  const handleSearchSelect = useCallback((item: SearchResult) => {
    setFlyTo(item);
    const layerByKind: Record<string, LayerKey> = { zone: "heatmap", village: "villages", hospital: "hospitals", sensor: "sensors", road: "roads" };
    setLayers((current) => ({ ...current, [layerByKind[item.kind]]: true }));
    if (!data) return;
    const collections = { zone: data.zones, village: data.villages, hospital: data.hospitals, sensor: data.sensors, road: data.roads } as const;
    const record = collections[item.kind].find((entry) => entry.id === item.id);
    if (record) setSelected({ kind: item.kind, data: record } as MapSelection);
  }, [data]);

  return <div className="risk-map-shell">
    {data && <MapView data={data} layers={layers} flyTo={flyTo} onSelect={handleSelect} />}
    <button className="mobile-toggle" onClick={() => setSidebarOpen((open) => !open)} aria-label="Toggle layers panel">☰</button>
    <div className="top-search"><SearchBar items={searchables} onSelect={handleSearchSelect} /></div>
    <LayerPanel layers={layers} open={sidebarOpen} onToggle={toggleLayer} onClose={() => setSidebarOpen(false)} />
    <Legend />
    {data && <div className="updated-chip"><span className="updated-chip__dot" />Updated {updatedLabel}</div>}
    {selected && <InfoPanel selection={selected} onClose={() => setSelected(null)} />}
    {isLoading && <div className="map-status">Loading live risk data...</div>}
    {!isLoading && error && <div className="map-status" role="alert">{error}</div>}
    {!isLoading && !error && data?.zones.length === 0 && <div className="map-status">No risk zones are available.</div>}
  </div>;
}
