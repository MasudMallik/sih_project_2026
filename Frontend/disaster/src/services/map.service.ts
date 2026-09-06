import { mapRoutes } from "../routes/map.routes";
import type { MapData } from "../interfaces/map.interface";
import { parseMapResponse } from "../validation/map.validation";

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export async function getMapData(signal?: AbortSignal): Promise<MapData> {
  const token = localStorage.getItem("geo-rakshak:access-token");
  const response = await fetch(`${API_BASE_URL}${mapRoutes.data}`, {
    signal,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to load risk map (${response.status})`);
  }

  return parseMapResponse(await response.json());
}
