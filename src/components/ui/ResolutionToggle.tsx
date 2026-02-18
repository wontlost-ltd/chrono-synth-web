import { useCallback, useRef } from 'react';
import type { Resolution } from '../../types';

const OPTIONS: Array<{ value: Resolution; label: string }> = [
  { value: 'year', label: '年' },
  { value: '2y', label: '2年' },
  { value: '5y', label: '5年' },
];

interface ResolutionToggleProps {
  value: Resolution;
  onChange: (v: Resolution) => void;
}

export function ResolutionToggle({ value, onChange }: ResolutionToggleProps) {
  const groupRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const idx = OPTIONS.findIndex(o => o.value === value);
    let next = idx;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { next = (idx + 1) % OPTIONS.length; }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { next = (idx - 1 + OPTIONS.length) % OPTIONS.length; }
    else return;
    e.preventDefault();
    onChange(OPTIONS[next]!.value);
    const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    buttons?.[next]?.focus();
  }, [value, onChange]);

  return (
    <div ref={groupRef} className="inline-flex rounded-lg border border-border bg-surface p-0.5" role="radiogroup" aria-label="时间分辨率" onKeyDown={handleKeyDown}>
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          onClick={() => onChange(opt.value)}
          aria-checked={value === opt.value}
          tabIndex={value === opt.value ? 0 : -1}
          className={`rounded-md px-3 py-2 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            value === opt.value
              ? 'bg-primary text-white'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
