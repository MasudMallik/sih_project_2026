import { useEffect, useMemo, useRef, useState } from "react";
import type { SearchResult } from "../../interfaces/map.interface";
import { Loader2, MapPin, Search, X } from "lucide-react";

interface SearchBarProps {
  items: SearchResult[];
  onSelect: (item: SearchResult) => void;
}

const POPULAR_LOCATIONS: SearchResult[] = [
  { id: "POP-01", name: "Teesta River Basin", type: "High Risk Corridor (Sikkim)", kind: "zone", coordinate: { lat: 27.24, lng: 88.52 } },
  { id: "POP-02", name: "Rangpo Valley & NH-10", type: "Critical Landslide Sector", kind: "zone", coordinate: { lat: 27.18, lng: 88.53 } },
  { id: "POP-03", name: "Gangtok City Center", type: "State Capital (Sikkim)", kind: "village", coordinate: { lat: 27.33, lng: 88.61 } },
  { id: "POP-04", name: "Guwahati & Kamrup", type: "Brahmaputra Flood Plain", kind: "zone", coordinate: { lat: 26.15, lng: 91.75 } },
  { id: "POP-05", name: "Chamoli / Joshimath", type: "Alaknanda Basin (Uttarakhand)", kind: "zone", coordinate: { lat: 30.41, lng: 79.33 } },
  { id: "POP-06", name: "Shimla Western Slopes", type: "Hill Station Subsidence Sector", kind: "zone", coordinate: { lat: 31.10, lng: 77.17 } },
  { id: "POP-07", name: "Darjeeling Hill Ridge", type: "Eastern Himalayan Slope", kind: "village", coordinate: { lat: 27.04, lng: 88.26 } },
];

function getCategoryIcon(kind: string): string {
  switch (kind) {
    case "zone":
      return "⛰";
    case "village":
      return "🏘";
    case "hospital":
      return "🏥";
    case "sensor":
      return "📡";
    case "road":
      return "🛣";
    default:
      return "📍";
  }
}

export function SearchBar({ items, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodedResults, setGeocodedResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<number | null>(null);

  // Local filtered items
  const localResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return items.filter((item) =>
      item.name.toLowerCase().includes(normalized) || item.type.toLowerCase().includes(normalized)
    );
  }, [items, query]);

  // Online Geocoding Search for Indian Cities / Towns / Districts
  useEffect(() => {
    const normalized = query.trim();
    if (!normalized || normalized.length < 3) {
      setGeocodedResults([]);
      setIsGeocoding(false);
      return;
    }

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(async () => {
      setIsGeocoding(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&limit=4&q=${encodeURIComponent(
            normalized
          )}`
        );
        if (res.ok) {
          const data = (await res.json()) as Array<{
            place_id: number;
            display_name: string;
            lat: string;
            lon: string;
            type: string;
          }>;
          const mapped: SearchResult[] = data.map((d) => ({
            id: `geo-${d.place_id}`,
            name: d.display_name.split(",")[0],
            type: d.display_name.split(",").slice(1, 3).join(",").trim() || "India Location",
            kind: "zone",
            coordinate: { lat: parseFloat(d.lat), lng: parseFloat(d.lon) },
          }));
          setGeocodedResults(mapped);
        }
      } catch {
        // Ignore geocoding network errors silently
      } finally {
        setIsGeocoding(false);
      }
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // Combined Results
  const allResults = useMemo(() => {
    if (!query.trim()) return [];
    const combined = [...localResults];
    geocodedResults.forEach((geo) => {
      if (!combined.some((c) => c.name.toLowerCase() === geo.name.toLowerCase())) {
        combined.push(geo);
      }
    });
    return combined.slice(0, 10);
  }, [localResults, geocodedResults, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allResults.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < allResults.length) {
        handleChoose(allResults[selectedIndex]);
      } else if (allResults.length > 0) {
        handleChoose(allResults[0]);
      }
    } else if (e.key === "Escape") {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleChoose = (item: SearchResult) => {
    onSelect(item);
    setQuery(item.name);
    setFocused(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery("");
    setGeocodedResults([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className="search-bar">
      <div className="search-bar__field flex items-center justify-between">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Search size={17} className="text-[#38e07b] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search sector, village, highway, district across India..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 200)}
            onKeyDown={handleKeyDown}
            aria-label="Search Monitored Sectors, Villages, Highways, and Indian Cities"
          />
        </div>
        {isGeocoding && <Loader2 size={16} className="text-[#38e07b] animate-spin shrink-0 mx-1" />}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-white p-1 shrink-0 rounded-full transition-colors"
            title="Clear search"
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {focused && (
        <div className="search-bar__results">
          {/* Active Search Results */}
          {query.trim() && (
            <>
              {allResults.length === 0 && !isGeocoding && (
                <div className="search-bar__empty flex items-center gap-2 text-sm text-[#9fb3a0]">
                  <MapPin size={15} className="text-gray-400" />
                  <span>No sectors or locations found for &ldquo;{query}&rdquo;</span>
                </div>
              )}
              {allResults.map((item, idx) => (
                <button
                  key={`${item.kind}-${item.id}-${idx}`}
                  className={`search-bar__result ${selectedIndex === idx ? "bg-[#38e07b]/20" : ""}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleChoose(item)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{getCategoryIcon(item.kind)}</span>
                      <strong className="truncate font-semibold text-[13.5px] text-[#f4efe4]">
                        {item.name}
                      </strong>
                    </div>
                    <span className="text-[10.5px] uppercase font-bold text-[#38e07b] bg-[#38e07b]/15 px-2 py-0.5 rounded shrink-0 ml-2">
                      {item.kind}
                    </span>
                  </div>
                  <span className="text-[11.5px] text-[#9fb3a0] truncate ml-6">{item.type}</span>
                </button>
              ))}
            </>
          )}

          {/* Quick Suggestions when input is empty */}
          {!query.trim() && (
            <div className="p-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#38e07b] mb-2 px-1">
                ⚡ Quick Focus Sectors & Hill Stations
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_LOCATIONS.map((pop) => (
                  <button
                    key={pop.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleChoose(pop)}
                    className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-[#38e07b]/20 hover:border-[#38e07b] border border-white/10 text-[#f4efe4] px-2.5 py-1.5 rounded-lg transition-all"
                  >
                    <span>{getCategoryIcon(pop.kind)}</span>
                    <span className="font-medium">{pop.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
