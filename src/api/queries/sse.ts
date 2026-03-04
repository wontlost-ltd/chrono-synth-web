import { useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../config';
import { getSession } from '../../store/session';

export function useSse<T = unknown>(channel: string, onMessage: (data: T) => void) {
  const callbackRef = useRef(onMessage);
  callbackRef.current = onMessage;

  useEffect(() => {
    const session = getSession();
    const params = new URLSearchParams({ channel });
    if (session.accessToken) params.set('token', session.accessToken);
    const es = new EventSource(`${API_BASE_URL}/api/v1/events?${params}`);

    es.onmessage = (e) => {
      try {
        callbackRef.current(JSON.parse(e.data) as T);
      } catch { /* 忽略解析错误 */ }
    };

    return () => es.close();
  }, [channel]);
}
