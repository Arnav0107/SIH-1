import { useState, useEffect, useRef, useCallback } from 'react';

export const API_BASE = (
  import.meta.env.VITE_API_BASE ||
  (typeof window !== 'undefined' && window.location.port !== '5173' && window.location.port !== '3000'
    ? window.location.origin
    : 'http://localhost:8000')
).replace(/\/+$/, '');

function getWebSocketUrl() {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  if (typeof window !== 'undefined' && window.location.port !== '5173' && window.location.port !== '3000') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws/engine`;
  }
  return 'ws://localhost:8000/ws/engine';
}

const WS_URL = getWebSocketUrl();
const RECONNECT_DELAY_MS = 2000;

export function useEngineTelemetry() {
  const [telemetry, setTelemetry] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!isMountedRef.current) return;

    try {
      const socket = new WebSocket(WS_URL);
      wsRef.current = socket;

      socket.onopen = () => {
        if (!isMountedRef.current) return;
        setIsConnected(true);
        setLastError(null);
        console.log('[useEngineTelemetry] WebSocket connected to', WS_URL);
      };

      socket.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          setTelemetry(data);
        } catch (err) {
          console.error('[useEngineTelemetry] JSON parse error:', err);
        }
      };

      socket.onerror = (event) => {
        if (!isMountedRef.current) return;
        console.warn('[useEngineTelemetry] WebSocket error:', event);
        setLastError('Connection error');
      };

      socket.onclose = (event) => {
        if (!isMountedRef.current) return;
        setIsConnected(false);
        setTelemetry(null);
        console.log(`[useEngineTelemetry] WebSocket closed (code ${event.code}). Reconnecting in ${RECONNECT_DELAY_MS}ms...`);
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      };
    } catch (err) {
      console.error('[useEngineTelemetry] Error creating WebSocket:', err);
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      isMountedRef.current = false;
      clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendCommand = useCallback((commandObject) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(commandObject));
      return true;
    } else {
      console.warn('[useEngineTelemetry] Cannot send command: socket is not open');
      return false;
    }
  }, []);

  return {
    telemetry,
    isConnected,
    lastError,
    sendCommand,
  };
}
