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
import { Crosshair } from "lucide-react";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { getCurrentUser } from "../services/auth.service";

const DEFAULT_LAYERS: LayerState = {
  heatmap: true,
  rainfall: false,
  soilMoisture: false,
  slope: false,
  roads: false,
  villages: false,
  hospitals: false,
  sensors: false,
  satellite: false,
};

export default function LiveRiskMap() {
  const user = getCurrentUser();
  const currentUser = {
    id: user?.email || "user@georakshak.org",
    name: user?.name || "Citizen",
    role: "Analyst",
    avatar: user?.name ? user.name.slice(0, 2).toUpperCase() : "RM",
  };
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
      ...data.zones.map((zone) => ({
        id: zone.id,
        name: zone.name,
        type: zone.type ?? "Risk zone",
        kind: "zone" as const,
        coordinate: zone.center,
      })),
      ...data.villages.map((village) => ({
        id: village.id,
        name: village.name,
        type: "Village",
        kind: "village" as const,
        coordinate: village.coordinate,
      })),
      ...data.hospitals.map((hospital) => ({
        id: hospital.id,
        name: hospital.name,
        type: "Hospital",
        kind: "hospital" as const,
        coordinate: hospital.coordinate,
      })),
      ...data.sensors.map((sensor) => ({
        id: sensor.id,
        name: sensor.name,
        type: "Sensor",
        kind: "sensor" as const,
        coordinate: sensor.coordinate,
      })),
      ...data.roads.map((road) => {
        let midCoord: { lat: number; lng: number } | undefined = undefined;
        if (road.geometry?.coordinates && Array.isArray(road.geometry.coordinates) && road.geometry.coordinates.length > 0) {
          const coords = road.geometry.coordinates as number[][];
          const mid = coords[Math.floor(coords.length / 2)];
          if (Array.isArray(mid) && mid.length >= 2) {
            midCoord = { lat: mid[1], lng: mid[0] };
          }
        }
        return {
          id: road.id,
          name: road.name,
          type: `${road.riskLevel ?? "Monitored"} Corridor`,
          kind: "road" as const,
          coordinate: midCoord,
        };
      }),
    ];
  }, [data]);

  const toggleLayer = useCallback((key: LayerKey) => {
    setLayers((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  const handleSelect = useCallback((selection: MapSelection) => {
    setSelected(selection);
  }, []);

  const handleSearchSelect = useCallback(
    (item: SearchResult) => {
      setFlyTo(item);
      const layerByKind: Record<string, LayerKey> = {
        zone: "heatmap",
        village: "villages",
        hospital: "hospitals",
        sensor: "sensors",
        road: "roads",
      };
      if (layerByKind[item.kind]) {
        setLayers((current) => ({ ...current, [layerByKind[item.kind]]: true }));
      }
      if (!data) return;
      const collections = {
        zone: data.zones,
        village: data.villages,
        hospital: data.hospitals,
        sensor: data.sensors,
        road: data.roads,
      } as const;
      const record = collections[item.kind].find((entry) => entry.id === item.id);
      if (record) setSelected({ kind: item.kind, data: record } as MapSelection);
    },
    [data]
  );

  const handleLocateMe = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFlyTo({
            id: "user-gps",
            name: "Your Live Location",
            type: "Current GPS Sector",
            kind: "zone",
            coordinate: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          });
        },
        () => {
          // If browser permission denied, default to high-risk monitored hub
          if (data && data.zones.length > 0) {
            setFlyTo({
              id: data.zones[0].id,
              name: data.zones[0].name,
              type: data.zones[0].type ?? "Risk Zone",
              kind: "zone",
              coordinate: data.zones[0].center,
            });
          }
        }
      );
    }
  }, [data]);

  return (
    <DashboardLayout
      user={{
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        avatar: currentUser.avatar,
      }}
      email={currentUser.id}
    >
      <div className="risk-map-shell flex-1 relative">
        {data && <MapView data={data} layers={layers} flyTo={flyTo} onSelect={handleSelect} />}
        <button
          className="mobile-toggle"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label="Toggle layers panel"
        >
          ☰
        </button>
        <div className="top-search">
          <SearchBar items={searchables} onSelect={handleSearchSelect} />
        </div>
        <LayerPanel
          layers={layers}
          open={sidebarOpen}
          onToggle={toggleLayer}
          onClose={() => setSidebarOpen(false)}
        />
        <Legend />

        {/* Locate Me GPS Quick Action Button */}
        <button
          className="locate-me-btn"
          onClick={handleLocateMe}
          title="Center / Restrict view to My Location"
          aria-label="Locate my position"
        >
          <Crosshair size={18} />
          <span>My Location</span>
        </button>

        {data && (
          <div className="updated-chip">
            <span className="updated-chip__dot" />
            Updated {updatedLabel}
          </div>
        )}
        {selected && <InfoPanel selection={selected} onClose={() => setSelected(null)} />}
        {isLoading && <div className="map-status">Loading live risk data...</div>}
        {!isLoading && error && (
          <div className="map-status" role="alert">
            {error}
          </div>
        )}
        {!isLoading && !error && data?.zones.length === 0 && (
          <div className="map-status">No risk zones are available.</div>
        )}
      </div>
    </DashboardLayout>
  );
}
