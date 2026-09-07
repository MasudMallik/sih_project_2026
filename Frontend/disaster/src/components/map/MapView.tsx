import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import type { LayerState, MapData, MapSelection, RiskZone, SearchResult } from "../../interfaces/map.interface";
import { riskColor } from "../../validation/map.validation";
import indiaDiplomaticGeoJson from "../../assets/geo/indiaDiplomaticBoundary.json";

// Centered on India with broad pan/zoom extent
const INDIA_DEFAULT_CENTER: L.LatLngExpression = [24.5, 85.0];
const INDIA_DEFAULT_ZOOM = 6;
const INDIA_MAX_BOUNDS: L.LatLngBoundsExpression = [
  [5.0, 66.0],
  [38.5, 99.0],
];

const palettes: Record<string, string[]> = {
  rainfall: ["#70d6ff", "#38bdf8", "#0284c7", "#1e3a8a"],
  soilMoisture: ["#e0e7ff", "#a5b4fc", "#6366f1", "#312e81"],
  slope: ["#fef08a", "#eab308", "#ca8a04", "#713f12"],
};

interface MapViewProps {
  data: MapData;
  layers: LayerState;
  flyTo: SearchResult | null;
  onSelect: (selection: MapSelection) => void;
}

function createPinIcon(color: string, iconSymbol: string, size = 28): L.DivIcon {
  const html = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: ${size}px;
      height: ${size}px;
      background: #0d1a10;
      border: 2px solid ${color};
      border-radius: 50%;
      box-shadow: 0 0 12px ${color}88, 0 4px 10px rgba(0,0,0,0.6);
      color: #f4efe4;
      font-size: ${Math.round(size * 0.48)}px;
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    " class="map-interactive-pin">
      ${iconSymbol}
    </div>
  `;
  return L.divIcon({
    className: "custom-map-pin",
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
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
  const ratio = Math.min(1.0, Math.max(0.0, value / max));
  return colors[ratio >= 0.75 ? 3 : ratio >= 0.5 ? 2 : ratio >= 0.25 ? 1 : 0];
}

function popupHtml(title: string, subtitle: string, stats?: Array<[string, string | number | undefined]>): string {
  const statsHtml = stats
    ? stats
        .filter(([, val]) => val !== undefined)
        .map(
          ([label, val]) => `
          <div style="display: flex; justify-content: space-between; gap: 8px; font-size: 11px; margin-top: 3px; color: #b7c7b8;">
            <span style="opacity: 0.8;">${label}:</span>
            <strong style="color: #f4efe4;">${val}</strong>
          </div>`
        )
        .join("")
    : "";

  return `
    <div style="font-family: 'Space Grotesk', system-ui, sans-serif; min-width: 170px; padding: 2px;">
      <h4 style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #f4efe4; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 3px;">
        ${title}
      </h4>
      <p style="margin: 2px 0 6px; font-size: 11.5px; color: #38e07b; font-weight: 600;">
        ${subtitle}
      </p>
      ${statsHtml}
    </div>
  `;
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface UserRiskAssessment {
  level: "Critical" | "High" | "Medium" | "Low";
  nearestZone: RiskZone | null;
  distanceKm: number;
  aiProbability: number;
  recommendation: string;
}

function evaluateUserRisk(userLat: number, userLng: number, zones: RiskZone[]): UserRiskAssessment {
  if (!zones || zones.length === 0) {
    return {
      level: "Low",
      nearestZone: null,
      distanceKm: 999,
      aiProbability: 12.0,
      recommendation: "Standard baseline conditions. Maintain regular weather awareness.",
    };
  }

  let minDistance = Infinity;
  let closestZone: RiskZone | null = null;

  zones.forEach((z) => {
    const pt = centroid(z);
    if (!pt) return;
    const dist = calculateDistanceKm(userLat, userLng, pt[0], pt[1]);
    if (dist < minDistance) {
      minDistance = dist;
      closestZone = z;
    }
  });

  if (!closestZone) {
    return {
      level: "Low",
      nearestZone: null,
      distanceKm: 999,
      aiProbability: 15.0,
      recommendation: "Normal environmental envelope. Low hazard risk in current perimeter.",
    };
  }

  const zone = closestZone as RiskZone;
  const zoneLevel = zone.riskLevel ?? "Low";
  const zoneProb = zone.aiProbability ?? 40.0;

  if (minDistance <= 15) {
    // Within direct zone impact radius
    return {
      level: zoneLevel,
      nearestZone: zone,
      distanceKm: minDistance,
      aiProbability: zoneProb,
      recommendation:
        zoneLevel === "Critical"
          ? "CRITICAL HAZARD: Immediate slope movement alert! Evacuate vulnerable structures and avoid riverbanks."
          : zoneLevel === "High"
          ? "HIGH HAZARD: Elevated landslide risk in immediate proximity. Restrict transit on mountain corridors."
          : zoneLevel === "Medium"
          ? "MODERATE WATCH: Saturated soil and rain alert active. Keep emergency kit ready."
          : "LOW HAZARD: Environmental sensors report stable ground parameters.",
    };
  } else if (minDistance <= 40) {
    // In secondary buffer zone
    const bufferLevel = zoneLevel === "Critical" ? "High" : zoneLevel === "High" ? "Medium" : "Low";
    return {
      level: bufferLevel,
      nearestZone: zone,
      distanceKm: minDistance,
      aiProbability: Math.max(10, Math.round(zoneProb * 0.7)),
      recommendation: `Adjacent to ${zone.name} (${minDistance.toFixed(1)} km away). Monitor local drainage and weather bulletins.`,
    };
  } else if (minDistance <= 80) {
    // Distant perimeter
    return {
      level: zoneLevel === "Critical" ? "Medium" : "Low",
      nearestZone: zone,
      distanceKm: minDistance,
      aiProbability: Math.max(5, Math.round(zoneProb * 0.4)),
      recommendation: `Monitored sector active ${minDistance.toFixed(1)} km away (${zone.name}). Conditions in your immediate area are stable.`,
    };
  } else {
    // Far stable area
    return {
      level: "Low",
      nearestZone: zone,
      distanceKm: minDistance,
      aiProbability: 8.5,
      recommendation: "Your location is well outside active hazard zones. Normal monitoring active.",
    };
  }
}

export function MapView({ data, layers, flyTo, onSelect }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const overlaysRef = useRef<Record<string, L.Layer>>({});
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: INDIA_DEFAULT_CENTER,
      zoom: INDIA_DEFAULT_ZOOM,
      zoomControl: false,
      minZoom: 4,
      maxZoom: 18,
      maxBounds: INDIA_MAX_BOUNDS,
      maxBoundsViscosity: 0.7,
    });

    // Add Zoom control at bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Free standard OpenStreetMap Tile Layer (No API key required)
    tileRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    // Add Official Diplomatic Map of India Boundary Overlay
    try {
      const boundaryLayer = L.geoJSON(indiaDiplomaticGeoJson as never, {
        style: {
          color: "#38e07b",
          weight: 2.2,
          opacity: 0.85,
          dashArray: "6 4",
          fillColor: "#38e07b",
          fillOpacity: 0.03,
        },
      });
      boundaryLayer.bindTooltip("Republic of India (Official Diplomatic Boundary)", {
        sticky: true,
        className: "diplomatic-boundary-tooltip",
      });
      boundaryLayer.addTo(map);
      overlaysRef.current.diplomaticBoundary = boundaryLayer;
    } catch (e) {
      console.warn("Could not load diplomatic boundary geojson:", e);
    }

    mapRef.current = map;

    // Detect User Location once on mount
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          console.log("User geolocation notice:", err.message);
        },
        { timeout: 8000 }
      );
    }

    // Invalidate size after layout settles to prevent grey/broken tiles
    const resizeTimer1 = setTimeout(() => map.invalidateSize(), 100);
    const resizeTimer2 = setTimeout(() => map.invalidateSize(), 300);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(resizeTimer1);
      clearTimeout(resizeTimer2);
      window.removeEventListener("resize", handleResize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle FlyTo animation
  useEffect(() => {
    if (flyTo?.coordinate && mapRef.current) {
      mapRef.current.flyTo([flyTo.coordinate.lat, flyTo.coordinate.lng], 10, {
        duration: 1.4,
        easeLinearity: 0.25,
      });
    }
  }, [flyTo]);

  // Handle Satellite Basemap Toggle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileRef.current) map.removeLayer(tileRef.current);

    if (layers.satellite) {
      tileRef.current = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles &copy; Esri",
          maxZoom: 18,
        }
      ).addTo(map);
    } else {
      tileRef.current = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }
      ).addTo(map);
    }
    tileRef.current.bringToBack();
  }, [layers.satellite]);

  // Render Overlay Layers (Connecting all layers for User Location too)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear dynamic overlays (preserve diplomatic boundary)
    const preserved = overlaysRef.current.diplomaticBoundary;
    Object.entries(overlaysRef.current).forEach(([k, layer]) => {
      if (k !== "diplomaticBoundary") {
        map.removeLayer(layer);
      }
    });
    overlaysRef.current = preserved ? { diplomaticBoundary: preserved } : {};

    const userAssessment = userLocation ? evaluateUserRisk(userLocation.lat, userLocation.lng, data.zones) : null;
    const userColor = userAssessment ? riskColor(userAssessment.level) : "#38E07B";

    // 1. RISK HEATMAP & ZONE POLYGONS (Includes User Location Hazard Marker)
    if (layers.heatmap && data.zones.length > 0) {
      const zoneGroup = L.layerGroup();

      data.zones.forEach((zone) => {
        const color = riskColor(zone.riskLevel);

        // Render Polygon if available
        if (zone.geometry) {
          L.geoJSON(
            {
              type: "Feature",
              properties: zone,
              geometry: zone.geometry,
            } as never,
            {
              style: {
                color: color,
                weight: 2,
                opacity: 0.9,
                fillColor: color,
                fillOpacity: zone.riskLevel === "Critical" ? 0.35 : 0.22,
              },
              onEachFeature: (_feat, layer) => {
                layer.bindTooltip(`${zone.name} (${zone.riskLevel} Risk)`, { sticky: true });
                layer.on("click", (e) => {
                  L.DomEvent.stopPropagation(e);
                  onSelect({ kind: "zone", data: zone });
                });
              },
            }
          ).addTo(zoneGroup);
        }

        // Render Centroid Pin
        const point = centroid(zone);
        if (point) {
          const iconSymbol = zone.riskLevel === "Critical" ? "🚨" : zone.riskLevel === "High" ? "⚠️" : "⛰";
          L.marker([point[0], point[1]], { icon: createPinIcon(color, iconSymbol, 30) })
            .bindPopup(
              popupHtml(zone.name, `${zone.riskLevel ?? "Unknown"} Risk Level`, [
                ["Rainfall (24h)", `${zone.rainfall24h ?? "--"} mm`],
                ["Soil Moisture", `${zone.soilMoisture ?? "--"}%`],
                ["Slope Angle", `${zone.slope ?? "--"}°`],
              ])
            )
            .on("click", () => onSelect({ kind: "zone", data: zone }))
            .addTo(zoneGroup);
        }
      });

      // User Location Risk Marker on Heatmap Layer
      if (userLocation && userAssessment) {
        const badgeText =
          userAssessment.level === "Critical"
            ? "🚨 CRITICAL"
            : userAssessment.level === "High"
            ? "⚠️ HIGH RISK"
            : userAssessment.level === "Medium"
            ? "⚡ MODERATE"
            : "🛡️ SAFE / LOW";

        const userPin = L.divIcon({
          className: "user-location-risk-pin",
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
              <div style="
                background: #0d1a10;
                color: ${userColor};
                border: 1.5px solid ${userColor};
                border-radius: 999px;
                font-size: 10px;
                font-weight: 800;
                padding: 2px 7px;
                white-space: nowrap;
                margin-bottom: 4px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.6), 0 0 10px ${userColor}66;
                letter-spacing: 0.04em;
              ">
                ${badgeText} (YOU)
              </div>
              <div style="position: relative; width: 26px; height: 26px;">
                <div style="position: absolute; inset: -6px; border-radius: 50%; background: ${userColor}; opacity: 0.35; animation: map-pulse 1.8s infinite;"></div>
                <div style="position: absolute; inset: 0; border-radius: 50%; background: #0d1a10; border: 3px solid ${userColor}; box-shadow: 0 0 14px ${userColor}; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 11px;">
                  📍
                </div>
              </div>
            </div>
          `,
          iconSize: [80, 50],
          iconAnchor: [40, 48],
          popupAnchor: [0, -48],
        });

        // Localized risk buffer ring around user
        L.circle([userLocation.lat, userLocation.lng], {
          radius: 6000,
          color: userColor,
          weight: 1.5,
          dashArray: "4 4",
          fillColor: userColor,
          fillOpacity: 0.15,
        }).addTo(zoneGroup);

        L.marker([userLocation.lat, userLocation.lng], { icon: userPin, zIndexOffset: 1000 })
          .bindPopup(
            popupHtml("📍 Your Live Location Assessment", `${userAssessment.level.toUpperCase()} HAZARD LEVEL`, [
              ["Nearest Risk Sector", userAssessment.nearestZone ? `${userAssessment.nearestZone.name} (${userAssessment.distanceKm.toFixed(1)} km)` : "None in immediate range"],
              ["Coordinates", `${userLocation.lat.toFixed(4)}° N, ${userLocation.lng.toFixed(4)}° E`],
            ])
          )
          .on("click", () => {
            onSelect({
              kind: "zone",
              data: {
                id: "USER-LOC",
                name: `Your Location (${userAssessment.level} Risk Condition)`,
                type: "Live User Position Telemetry",
                district: userAssessment.nearestZone?.district ?? "Local Sector",
                riskLevel: userAssessment.level,
                riskScore: userAssessment.level === "Critical" ? 90 : userAssessment.level === "High" ? 75 : userAssessment.level === "Medium" ? 50 : 20,
                rainfall24h: userAssessment.nearestZone?.rainfall24h,
                soilMoisture: userAssessment.nearestZone?.soilMoisture,
                slope: userAssessment.nearestZone?.slope,
                recommendedAction: userAssessment.recommendation,
                lastIncident: `Nearest hazard zone: ${userAssessment.nearestZone?.name ?? "Nominal"} (${userAssessment.distanceKm.toFixed(1)} km away)`,
              },
            });
          })
          .addTo(zoneGroup);
      }

      zoneGroup.addTo(map);
      overlaysRef.current.heatmap = zoneGroup;
    }

    // 2. RAINFALL LAYER (Includes User Location Precipitation)
    if (layers.rainfall && data.zones.length > 0) {
      const rainGroup = L.layerGroup();
      data.zones.forEach((zone) => {
        const point = centroid(zone);
        if (!point) return;
        const color = metricColor(zone.rainfall24h, 250, "rainfall");
        L.circle([point[0], point[1]], {
          radius: 12000,
          color: color,
          weight: 1.5,
          fillColor: color,
          fillOpacity: 0.3,
        }).addTo(rainGroup);

        L.marker([point[0] + 0.03, point[1] + 0.03], {
          icon: createPinIcon(color, "🌧", 24),
        })
          .bindPopup(popupHtml(zone.name, `Precipitation: ${zone.rainfall24h ?? 0} mm/24h`))
          .addTo(rainGroup);
      });

      // User Location Rainfall Overlay
      if (userLocation) {
        const userRainVal = userAssessment?.nearestZone?.rainfall24h ? Math.round(userAssessment.nearestZone.rainfall24h * 0.85) : 65;
        const userRainColor = metricColor(userRainVal, 250, "rainfall");

        L.circle([userLocation.lat, userLocation.lng], {
          radius: 10000,
          color: userRainColor,
          weight: 2,
          fillColor: userRainColor,
          fillOpacity: 0.35,
        }).addTo(rainGroup);

        L.marker([userLocation.lat, userLocation.lng], {
          icon: createPinIcon(userRainColor, "🌧", 26),
          zIndexOffset: 950,
        })
          .bindPopup(popupHtml("📍 Your Area Precipitation", `Estimated Rainfall: ${userRainVal} mm/24h`))
          .addTo(rainGroup);
      }

      rainGroup.addTo(map);
      overlaysRef.current.rainfall = rainGroup;
    }

    // 3. SOIL MOISTURE LAYER (Includes User Location Soil Saturation)
    if (layers.soilMoisture && data.zones.length > 0) {
      const moistureGroup = L.layerGroup();
      data.zones.forEach((zone) => {
        const point = centroid(zone);
        if (!point) return;
        const color = metricColor(zone.soilMoisture, 100, "soilMoisture");
        L.circle([point[0], point[1]], {
          radius: 9000,
          color: color,
          weight: 1.5,
          fillColor: color,
          fillOpacity: 0.28,
        }).addTo(moistureGroup);

        L.marker([point[0] - 0.03, point[1] + 0.03], {
          icon: createPinIcon(color, "💧", 24),
        })
          .bindPopup(popupHtml(zone.name, `Soil Saturation: ${zone.soilMoisture ?? 0}%`))
          .addTo(moistureGroup);
      });

      // User Location Soil Moisture Overlay
      if (userLocation) {
        const userMoistureVal = userAssessment?.nearestZone?.soilMoisture ? Math.round(userAssessment.nearestZone.soilMoisture * 0.9) : 58;
        const userMoistureColor = metricColor(userMoistureVal, 100, "soilMoisture");

        L.circle([userLocation.lat, userLocation.lng], {
          radius: 8000,
          color: userMoistureColor,
          weight: 2,
          fillColor: userMoistureColor,
          fillOpacity: 0.3,
        }).addTo(moistureGroup);

        L.marker([userLocation.lat, userLocation.lng], {
          icon: createPinIcon(userMoistureColor, "💧", 26),
          zIndexOffset: 950,
        })
          .bindPopup(popupHtml("📍 Your Local Soil Moisture", `Soil Saturation Index: ${userMoistureVal}%`))
          .addTo(moistureGroup);
      }

      moistureGroup.addTo(map);
      overlaysRef.current.soilMoisture = moistureGroup;
    }

    // 4. SLOPE LAYER (Includes User Location Incline)
    if (layers.slope && data.zones.length > 0) {
      const slopeGroup = L.layerGroup();
      data.zones.forEach((zone) => {
        const point = centroid(zone);
        if (!point) return;
        const color = metricColor(zone.slope, 60, "slope");
        L.marker([point[0] + 0.03, point[1] - 0.03], {
          icon: createPinIcon(color, "📐", 24),
        })
          .bindPopup(popupHtml(zone.name, `Slope Incline: ${zone.slope ?? 0}°`))
          .addTo(slopeGroup);
      });

      // User Location Slope Gradient Overlay
      if (userLocation) {
        const userSlopeVal = userAssessment?.nearestZone?.slope ? Math.round(userAssessment.nearestZone.slope * 0.7) : 18;
        const userSlopeColor = metricColor(userSlopeVal, 60, "slope");

        L.marker([userLocation.lat, userLocation.lng], {
          icon: createPinIcon(userSlopeColor, "📐", 26),
          zIndexOffset: 950,
        })
          .bindPopup(popupHtml("📍 Your Area Slope Incline", `Estimated Terrain Incline: ${userSlopeVal}°`))
          .addTo(slopeGroup);
      }

      slopeGroup.addTo(map);
      overlaysRef.current.slope = slopeGroup;
    }

    // 5. ROADS & TRANSIT CORRIDORS LAYER
    if (layers.roads && data.roads.length > 0) {
      const roadLayer = L.layerGroup();
      data.roads.forEach((road) => {
        if (!road.geometry) return;
        const color = riskColor(road.riskLevel);
        L.geoJSON(
          {
            type: "Feature",
            properties: road,
            geometry: road.geometry,
          } as never,
          {
            style: {
              color: color,
              weight: 5,
              opacity: 0.85,
              dashArray: road.riskLevel === "Critical" ? "8 6" : "0",
            },
            onEachFeature: (_feature, layer) => {
              layer.bindTooltip(`${road.name} (${road.riskLevel ?? "Normal"} Status)`, { sticky: true });
              layer.on("click", (event) => {
                L.DomEvent.stopPropagation(event);
                onSelect({ kind: "road", data: road });
              });
            },
          }
        ).addTo(roadLayer);
      });
      roadLayer.addTo(map);
      overlaysRef.current.roads = roadLayer;
    }

    // 6. VILLAGES LAYER
    if (layers.villages && data.villages.length > 0) {
      const vilGroup = L.layerGroup();
      data.villages.forEach((vil) => {
        const color = riskColor(vil.riskLevel);
        L.marker([vil.coordinate.lat, vil.coordinate.lng], {
          icon: createPinIcon(color, "🏘", 24),
        })
          .bindPopup(
            popupHtml(vil.name, `Village (${vil.riskLevel ?? "Monitored"})`, [
              ["Population", vil.population?.toLocaleString() ?? "N/A"],
            ])
          )
          .on("click", () => onSelect({ kind: "village", data: vil }))
          .addTo(vilGroup);
      });
      vilGroup.addTo(map);
      overlaysRef.current.villages = vilGroup;
    }

    // 7. HOSPITALS LAYER
    if (layers.hospitals && data.hospitals.length > 0) {
      const hospGroup = L.layerGroup();
      data.hospitals.forEach((hosp) => {
        L.marker([hosp.coordinate.lat, hosp.coordinate.lng], {
          icon: createPinIcon("#EF4444", "🏥", 24),
        })
          .bindPopup(
            popupHtml(hosp.name, "Emergency Medical Center", [
              ["Bed Capacity", hosp.beds?.toLocaleString() ?? "N/A"],
              ["Triage Readiness", "Active"],
            ])
          )
          .on("click", () => onSelect({ kind: "hospital", data: hosp }))
          .addTo(hospGroup);
      });
      hospGroup.addTo(map);
      overlaysRef.current.hospitals = hospGroup;
    }

    // 8. IOT SENSORS LAYER
    if (layers.sensors && data.sensors.length > 0) {
      const sensGroup = L.layerGroup();
      data.sensors.forEach((sensor) => {
        const color = sensor.status === "Active" ? "#38E07B" : "#94A3B8";
        L.marker([sensor.coordinate.lat, sensor.coordinate.lng], {
          icon: createPinIcon(color, "📡", 24),
        })
          .bindPopup(
            popupHtml(sensor.name, `Status: ${sensor.status ?? "Active"}`, [
              ["Live Reading", sensor.reading ?? "Telemetry Nominal"],
            ])
          )
          .on("click", () => onSelect({ kind: "sensor", data: sensor }))
          .addTo(sensGroup);
      });
      sensGroup.addTo(map);
      overlaysRef.current.sensors = sensGroup;
    }
  }, [data, layers, onSelect, userLocation]);

  return <div className="map-root" ref={containerRef} />;
}
