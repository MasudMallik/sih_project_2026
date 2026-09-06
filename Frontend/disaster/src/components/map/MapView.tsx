import { useEffect, useRef } from "react";
import L from "leaflet";
import type { LayerState, MapData, MapSelection, RiskZone, SearchResult } from "../../interfaces/map.interface";
import { riskColor } from "../../validation/map.validation";

const NORTH_INDIA_CENTER: L.LatLngExpression = [29.5, 78.5];
const NORTH_INDIA_BOUNDS: L.LatLngBoundsExpression = [[23.5, 68.5], [37.5, 88.5]];
const palettes: Record<string, string[]> = {
  rainfall: ["#bfe3f5", "#5fb0e0", "#2b7bc4", "#154b82"],
  soilMoisture: ["#e8d9bd", "#c9a06a", "#9c6b34", "#603c1a"],
  slope: ["#eef0b0", "#d3c25a", "#a68f2e", "#6e5a15"],
};

interface MapViewProps {
  data: MapData;
  layers: LayerState;
  flyTo: SearchResult | null;
  onSelect: (selection: MapSelection) => void;
}

function pinIcon(color: string, size = 22): L.DivIcon {
  const height = size * 1.36;
  const svg = `<svg width="${size}" height="${height}" viewBox="0 0 25 34" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 0C5.6 0 0 5.6 0 12.5 0 21.6 12.5 34 12.5 34S25 21.6 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${color}" stroke="#ffffff" stroke-width="1.5"/><circle cx="12.5" cy="12.5" r="5.5" fill="#ffffff"/><circle cx="12.5" cy="12.5" r="2.6" fill="${color}"/></svg>`;
  return L.divIcon({ className: "", html: svg, iconSize: [size, height], iconAnchor: [size / 2, height], popupAnchor: [0, -height + 6] });
}

function centroid(zone: RiskZone): [number, number] | null {
  const geometry = zone.geometry;
  if (!geometry) return zone.center ? [zone.center.lat, zone.center.lng] : null;
  const ring = geometry.type === "Polygon" ? geometry.coordinates[0] : geometry.coordinates[0][0];
  if (!Array.isArray(ring) || ring.length === 0) return null;
  const points = ring as number[][];
  const lng = points.reduce((sum, point) => sum + point[0], 0) / points.length;
  const lat = points.reduce((sum, point) => sum + point[1], 0) / points.length;
  return [lat, lng];
}

function metricColor(value: number | undefined, max: number, palette: string): string {
  const colors = palettes[palette];
  if (value === undefined || !colors) return "#9aa1b5";
  const ratio = value / max;
  return colors[ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : ratio >= 0.35 ? 1 : 0];
}

function popupHtml(name: string, detail: string): string {
  return `<div class="map-popup"><h4>${name}</h4><p>${detail}</p></div>`;
}

export function MapView({ data, layers, flyTo, onSelect }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const overlaysRef = useRef<Record<string, L.Layer>>({});

  useEffect(() => {
    if (!containerRef.current) return;
    const map = L.map(containerRef.current, { center: NORTH_INDIA_CENTER, zoom: 6, zoomControl: true, minZoom: 5, maxBoundsViscosity: 1 });
    map.fitBounds(NORTH_INDIA_BOUNDS, { padding: [10, 10] });
    map.setMaxBounds(L.latLngBounds([[23.5, 68.5], [37.5, 88.5]]).pad(0.15));
    tileRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap contributors" }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (flyTo?.coordinate && mapRef.current) {
      mapRef.current.flyTo([flyTo.coordinate.lat, flyTo.coordinate.lng], 10, { duration: 1.1 });
    }
  }, [flyTo]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileRef.current) map.removeLayer(tileRef.current);
    tileRef.current = (layers.satellite
      ? L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { attribution: "Tiles &copy; Esri" })
      : L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap contributors" })).addTo(map);
    tileRef.current.bringToBack();
  }, [layers.satellite]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    Object.values(overlaysRef.current).forEach((layer) => map.removeLayer(layer));
    overlaysRef.current = {};

    const addZoneMarkers = (key: string, colorFor: (zone: RiskZone) => string, offset: [number, number] = [0, 0]) => {
      const group = L.layerGroup();
      data.zones.forEach((zone) => {
        const point = centroid(zone);
        if (!point) return;
        L.marker([point[0] + offset[0], point[1] + offset[1]], { icon: pinIcon(colorFor(zone), 17) })
          .bindPopup(popupHtml(zone.name, `${zone.riskLevel ?? "Unknown"} risk`))
          .on("click", () => onSelect({ kind: "zone", data: zone }))
          .addTo(group);
      });
      group.addTo(map);
      overlaysRef.current[key] = group;
    };

    if (layers.heatmap) addZoneMarkers("heatmap", (zone) => riskColor(zone.riskLevel));
    if (layers.rainfall) addZoneMarkers("rainfall", (zone) => metricColor(zone.rainfall24h, 180, "rainfall"), [0.045, 0.045]);
    if (layers.soilMoisture) addZoneMarkers("soilMoisture", (zone) => metricColor(zone.soilMoisture, 100, "soilMoisture"), [-0.045, 0.045]);
    if (layers.slope) addZoneMarkers("slope", (zone) => metricColor(zone.slope, 45, "slope"), [0.045, -0.045]);

    if (layers.roads && data.roads.length > 0) {
      const roadLayer = L.layerGroup();
      data.roads.forEach((road) => {
        if (!road.geometry) return;
        L.geoJSON({ type: "Feature", properties: road, geometry: road.geometry } as never, {
          style: { color: riskColor(road.riskLevel), weight: 4, dashArray: "4 4" },
          onEachFeature: (_feature, layer) => {
            layer.bindTooltip(road.name, { sticky: true });
            layer.on("click", (event) => { L.DomEvent.stopPropagation(event); onSelect({ kind: "road", data: road }); });
          },
        }).addTo(roadLayer);
      });
      roadLayer.addTo(map);
      overlaysRef.current.roads = roadLayer;
    }

    const addPoints = (key: "villages" | "hospitals" | "sensors") => {
      const group = L.layerGroup();
      const records = data[key];
      records.forEach((record) => {
        const color = key === "villages" ? "#dfa23f" : key === "hospitals" ? "#e14b3c" : (record as typeof data.sensors[number]).status === "Active" ? "#4caf6d" : "#8a8f9c";
        const detail = key === "villages" ? `Population: ${(record as typeof data.villages[number]).population?.toLocaleString() ?? "Unavailable"}` : key === "hospitals" ? `Beds: ${(record as typeof data.hospitals[number]).beds ?? "Unavailable"}` : `Status: ${(record as typeof data.sensors[number]).status ?? "Unknown"}`;
        L.marker([record.coordinate.lat, record.coordinate.lng], { icon: pinIcon(color, 14) })
          .bindPopup(popupHtml(record.name, detail))
          .on("click", () => onSelect({ kind: key === "villages" ? "village" : key === "hospitals" ? "hospital" : "sensor", data: record }))
          .addTo(group);
      });
      group.addTo(map);
      overlaysRef.current[key] = group;
    };

    if (layers.villages) addPoints("villages");
    if (layers.hospitals) addPoints("hospitals");
    if (layers.sensors) addPoints("sensors");
  }, [data, layers, onSelect]);

  return <div className="map-root" ref={containerRef} />;
}
