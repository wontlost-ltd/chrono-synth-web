import { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { MilestoneEvent } from '../../types';
import { formatMetricValue } from '../../utils/format';

interface MilestoneTimelineProps {
  events: MilestoneEvent[];
  onSelect?: (event: MilestoneEvent) => void;
}

const KIND_STYLES: Record<string, { bg: string; icon: string }> = {
  peak: { bg: 'bg-success/10 border-success', icon: '▲' },
  trough: { bg: 'bg-warning/10 border-warning', icon: '▼' },
  cross_up: { bg: 'bg-accent/10 border-accent', icon: '⬆' },
  cross_down: { bg: 'bg-primary/10 border-primary', icon: '⬇' },
};

const KIND_LABELS: Record<string, string> = {
  peak: '峰值',
  trough: '谷值',
  cross_up: '上穿',
  cross_down: '下穿',
};

const VIRTUAL_THRESHOLD = 50;
const ITEM_HEIGHT = 72;

export function MilestoneTimeline({ events, onSelect }: MilestoneTimelineProps) {
  const sorted = useMemo(() => [...events].sort((a, b) => a.year - b.year), [events]);
  const interactive = !!onSelect;
  const useVirtual = sorted.length >= VIRTUAL_THRESHOLD;

  if (useVirtual) {
    return <VirtualTimeline sorted={sorted} interactive={interactive} onSelect={onSelect} />;
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" aria-hidden="true" />
      <ol className="space-y-3 pl-10">
        {sorted.map((event, i) => (
          <TimelineItem key={`${event.metric}-${event.kind}-${event.year}-${i}`} event={event} interactive={interactive} onSelect={onSelect} />
        ))}
      </ol>
    </div>
  );
}

function VirtualTimeline({ sorted, interactive, onSelect }: { sorted: MilestoneEvent[]; interactive: boolean; onSelect?: (e: MilestoneEvent) => void }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: sorted.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 10,
  });

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" aria-hidden="true" />
      <div ref={parentRef} className="max-h-[min(600px,60vh)] overflow-auto pl-10">
        <ol className="relative" style={{ height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map(row => {
            const event = sorted[row.index]!;
            return (
              <li
                key={`${event.metric}-${event.kind}-${event.year}-${row.index}`}
                className="absolute left-0 w-full"
                style={{ height: row.size, transform: `translateY(${row.start}px)` }}
              >
                <TimelineItem event={event} interactive={interactive} onSelect={onSelect} />
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function TimelineItem({ event, interactive, onSelect }: { event: MilestoneEvent; interactive: boolean; onSelect?: (e: MilestoneEvent) => void }) {
  const style = KIND_STYLES[event.kind] ?? KIND_STYLES['peak']!;
  const kindLabel = KIND_LABELS[event.kind] ?? event.kind;
  const label = `Y${event.year} ${kindLabel} ${event.metric} ${formatMetricValue(event.value, '')}`;
  const content = (
    <>
      <span className="absolute -left-7 top-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-surface-elevated text-xs shadow" aria-hidden="true">
        {style.icon}
      </span>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">
          Y{event.year} · {kindLabel} · {event.metric}
        </span>
        <span className="text-sm font-bold">{formatMetricValue(event.value, '')}</span>
      </div>
      {event.threshold != null && (
        <p className="mt-0.5 text-xs text-text-secondary">
          阈值: {event.threshold}
        </p>
      )}
    </>
  );

  if (interactive) {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(event)}
        aria-label={label}
        className={`relative w-full rounded-lg border p-3 text-left transition-colors hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${style.bg}`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`relative w-full rounded-lg border p-3 ${style.bg}`} aria-label={label}>
      {content}
    </div>
  );
}
