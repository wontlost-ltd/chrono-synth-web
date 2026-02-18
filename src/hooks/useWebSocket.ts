import { useEffect, useRef, useCallback, useState } from 'react';

export type WsStatus = 'connecting' | 'connected' | 'disconnected';

interface WsEvent {
  type: string;
  payload: unknown;
  timestamp: string;
}

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/ws`,
    autoConnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const attemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const listenersRef = useRef(new Map<string, Set<(payload: unknown) => void>>());
  const [status, setStatus] = useState<WsStatus>('disconnected');
  const [lastEvent, setLastEvent] = useState<WsEvent | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      attemptsRef.current = 0;
      // 重连后重新订阅所有事件
      for (const eventType of listenersRef.current.keys()) {
        ws.send(JSON.stringify({ action: 'subscribe', event: eventType }));
      }
    };

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as WsEvent;
        setLastEvent(data);
        const handlers = listenersRef.current.get(data.type);
        if (handlers) {
          for (const fn of handlers) fn(data.payload);
        }
      } catch { /* non-JSON message ignored */ }
    };

    ws.onclose = () => {
      setStatus('disconnected');
      wsRef.current = null;
      if (attemptsRef.current < maxReconnectAttempts) {
        attemptsRef.current++;
        reconnectTimerRef.current = setTimeout(connect, reconnectInterval);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [url, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    clearTimeout(reconnectTimerRef.current);
    attemptsRef.current = maxReconnectAttempts;
    wsRef.current?.close();
  }, [maxReconnectAttempts]);

  const subscribe = useCallback((eventType: string, handler: (payload: unknown) => void) => {
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    listenersRef.current.get(eventType)!.add(handler);

    // Send subscription message to server
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'subscribe', event: eventType }));
    }

    return () => {
      listenersRef.current.get(eventType)?.delete(handler);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: 'unsubscribe', event: eventType }));
      }
    };
  }, []);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    if (autoConnect) connect();
    return () => {
      clearTimeout(reconnectTimerRef.current);
      attemptsRef.current = maxReconnectAttempts;
      wsRef.current?.close();
    };
  }, [autoConnect, connect, maxReconnectAttempts]);

  return { status, lastEvent, connect, disconnect, subscribe, send };
}
