import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { WsStatus } from '../../hooks/useWebSocket';

interface DataPoint {
  time: string;
  value: number;
}

interface LiveMetricStreamProps {
  subscribe: (eventType: string, handler: (payload: unknown) => void) => () => void;
  status: WsStatus;
  eventType?: string;
  maxPoints?: number;
}

export function LiveMetricStream({
  subscribe,
  status,
  eventType = 'metric:stream',
  maxPoints = 50,
}: LiveMetricStreamProps) {
  const { t } = useTranslation();
  const [data, setData] = useState<DataPoint[]>([]);
  const maxRef = useRef(maxPoints);
  maxRef.current = maxPoints;

  const handleEvent = useCallback((payload: unknown) => {
    const p = payload as { value?: number; timestamp?: string };
    if (typeof p?.value !== 'number') return;
    const point: DataPoint = {
      time: p.timestamp ? new Date(p.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
      value: p.value,
    };
    setData(prev => {
      const next = [...prev, point];
      return next.length > maxRef.current ? next.slice(-maxRef.current) : next;
    });
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe(eventType, handleEvent);
    return unsubscribe;
  }, [subscribe, eventType, handleEvent]);

  if (status !== 'connected') {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-text-secondary">
        {t('liveMetricStream.waitingForConnection')}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-text-secondary">
        {t('liveMetricStream.waitingForData')}
      </div>
    );
  }

  return (
    <div role="img" aria-label={t('liveMetricStream.chartLabel')}>
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="var(--color-primary, #6366f1)" strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
    </div>
  );
}
