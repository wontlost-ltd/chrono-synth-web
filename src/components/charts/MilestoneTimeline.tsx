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

export function MilestoneTimeline({ events, onSelect }: MilestoneTimelineProps) {
  const sorted = [...events].sort((a, b) => a.year - b.year);
  const interactive = !!onSelect;

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" aria-hidden="true" />
      <ol className="space-y-3 pl-10">
        {sorted.map((event, i) => {
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
              <li key={`${event.metric}-${event.kind}-${event.year}-${i}`}>
                <button
                  type="button"
                  onClick={() => onSelect(event)}
                  aria-label={label}
                  className={`relative w-full rounded-lg border p-3 text-left transition-colors hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${style.bg}`}
                >
                  {content}
                </button>
              </li>
            );
          }

          return (
            <li
              key={`${event.metric}-${event.kind}-${event.year}-${i}`}
              className={`relative w-full rounded-lg border p-3 ${style.bg}`}
              aria-label={label}
            >
              {content}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
