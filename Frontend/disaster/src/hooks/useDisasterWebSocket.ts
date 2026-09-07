import { useState, useEffect, useRef, useCallback } from 'react';

export interface DisasterMessage {
  disasterType: string;
  location: string;
  message: string;
  [key: string]: any;
}

export interface SosMessage {
  message: string;
  [key: string]: any;
}

export interface UseAlertWebSocketReturn {
  disasterMessage: DisasterMessage | null;
  sosMessage: SosMessage | null;
  clearDisaster: () => void;
  clearSos: () => void;
}

/**
 * Hook that connects to the FastAPI WebSocket at ws://localhost:8000/ws.
 * Listens for messages of type "disaster" or "sos".
 */
export default function useAlertWebSocket(): UseAlertWebSocketReturn {
  const [disasterMessage, setDisasterMessage] = useState<DisasterMessage | null>(null);
  const [sosMessage, setSosMessage] = useState<SosMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const clearDisaster = useCallback(() => setDisasterMessage(null), []);
  const clearSos = useCallback(() => setSosMessage(null), []);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'disaster') {
          setDisasterMessage({
            disasterType: data.disasterType ?? 'Disaster',
            location: data.location ?? 'unknown',
            message: data.message ?? '',
            ...data,
          });
        } else if (data.type === 'sos') {
          setSosMessage({
            message: data.message ?? 'SOS Alert Received',
            ...data,
          });
        }
      } catch {
        // ignore non‑JSON messages
      }
    };

    ws.onerror = (e) => console.error('WebSocket error:', e);
    ws.onclose = () => { wsRef.current = null; };

    return () => ws.close();
  }, []);

  return { disasterMessage, sosMessage, clearDisaster, clearSos };
}

// Backward compatible export for existing imports
export const useDisasterWebSocket = useAlertWebSocket;
