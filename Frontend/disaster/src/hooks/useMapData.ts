import { useEffect, useState } from "react";
import type { MapData } from "../interfaces/map.interface";
import { getMapData } from "../services/map.service";

interface MapDataState {
  data: MapData | null;
  isLoading: boolean;
  error: string | null;
}

export function useMapData(): MapDataState {
  const [state, setState] = useState<MapDataState>({ data: null, isLoading: true, error: null });

  useEffect(() => {
    let disposed = false;
    let controller = new AbortController();
    const pollInterval = Number(import.meta.env.VITE_MAP_POLL_INTERVAL_MS ?? 60000);

    const load = async () => {
      controller.abort();
      controller = new AbortController();
      try {
        const data = await getMapData(controller.signal);
        if (!disposed) setState({ data, isLoading: false, error: null });
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (!disposed) {
          const message = error instanceof Error ? error.message : "Unable to load risk map.";
          setState((current) => ({ data: current.data, isLoading: false, error: message }));
        }
      }
    };

    void load();
    const timer = window.setInterval(() => void load(), Number.isFinite(pollInterval) && pollInterval > 0 ? pollInterval : 60000);
    return () => {
      disposed = true;
      window.clearInterval(timer);
      controller.abort();
    };
  }, []);

  return state;
}
