import type { MetricKey, MetricMeta } from '../../types';

const DEFAULT_OPTIONS: Array<{ key: MetricKey; label: string }> = [
  { key: 'wealth', label: '财富' },
  { key: 'healthIndex', label: '健康指数' },
  { key: 'overallScore', label: '综合评分' },
  { key: 'emotionalState.valence', label: '情绪效价' },
  { key: 'emotionalState.stress', label: '压力' },
  { key: 'emotionalState.fulfillment', label: '成就感' },
  { key: 'emotionalState.regret', label: '后悔' },
  { key: 'familyState.spouseSecurity', label: '配偶安全感' },
  { key: 'familyState.childCost', label: '育儿成本' },
  { key: 'familyState.familyPressure', label: '家庭压力' },
];

interface MetricSelectorProps {
  selected: MetricKey[];
  onChange: (keys: MetricKey[]) => void;
  metricMeta?: MetricMeta[];
}

export function MetricSelector({ selected, onChange, metricMeta }: MetricSelectorProps) {
  const options = metricMeta?.map(m => ({ key: m.key, label: m.label })) ?? DEFAULT_OPTIONS;

  function toggle(key: MetricKey) {
    if (selected.includes(key)) {
      onChange(selected.filter(k => k !== key));
    } else {
      onChange([...selected, key]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="指标选择">
      {options.map(opt => (
        <button
          key={opt.key}
          type="button"
          onClick={() => toggle(opt.key)}
          aria-pressed={selected.includes(opt.key)}
          className={`rounded-full px-3 py-2 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            selected.includes(opt.key)
              ? 'bg-primary text-white'
              : 'bg-surface border border-border text-text-secondary hover:border-primary'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
