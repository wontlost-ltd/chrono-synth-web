import { formatMetricValue } from '../../utils/format';

interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
  className?: string;
}

const TREND_ICONS: Record<string, string> = { up: '↑', down: '↓', flat: '→' };
const TREND_COLORS: Record<string, string> = {
  up: 'text-success',
  down: 'text-warning',
  flat: 'text-text-secondary',
};

export function MetricCard({ title, value, unit = '', trend, className = '' }: MetricCardProps) {
  return (
    <div className={`rounded-xl border border-border bg-surface-elevated p-4 ${className}`}>
      <p className="text-xs font-medium text-text-secondary">{title}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-bold">{formatMetricValue(value, unit)}</span>
        {trend && (
          <span className={`text-sm font-medium ${TREND_COLORS[trend]}`}>
            {TREND_ICONS[trend]}
          </span>
        )}
      </div>
    </div>
  );
}
