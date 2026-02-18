import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useValues, useCreateValue } from '../api/queries/values';

export function ValuesManager() {
  const { data: values, isLoading, error } = useValues();
  const createValue = useCreateValue();

  const [newLabel, setNewLabel] = useState('');
  const [newWeight, setNewWeight] = useState(0.5);
  const [addError, setAddError] = useState<string | null>(null);

  async function handleAdd() {
    if (!newLabel.trim()) { setAddError('名称不能为空'); return; }
    if (!Number.isFinite(newWeight) || newWeight < 0 || newWeight > 1) { setAddError('权重必须在 0-1 之间'); return; }
    setAddError(null);
    try {
      await createValue.mutateAsync({ label: newLabel.trim(), weight: newWeight });
      setNewLabel('');
      setNewWeight(0.5);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : '添加价值观失败');
    }
  }

  return (
    <>
      <PageHeader title="价值观管理" subtitle="定义和调整人生价值权重" />

      <form className="mb-6 rounded-xl border border-border bg-surface-elevated p-4" onSubmit={e => { e.preventDefault(); handleAdd(); }}>
        <h3 className="mb-3 text-sm font-medium text-text-secondary">添加价值观</h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1">
            <span className="sr-only">价值观名称</span>
            <input
              className="w-full rounded-lg border border-border px-3 py-1.5 text-sm"
              placeholder="价值观名称"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              aria-invalid={addError?.includes('名称') || undefined}
              aria-describedby={addError ? 'values-form-error' : undefined}
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">权重</span>
            <input
              type="range"
              min="0" max="1" step="0.1"
              value={newWeight}
              onChange={e => setNewWeight(+e.target.value)}
              className="w-24"
              aria-label={`权重: ${newWeight.toFixed(1)}`}
              aria-invalid={addError?.includes('权重') || undefined}
              aria-describedby={addError ? 'values-form-error' : undefined}
            />
            <span className="w-8 text-xs" aria-hidden="true">{newWeight.toFixed(1)}</span>
          </label>
          <button
            type="submit"
            disabled={createValue.isPending}
            className="rounded-lg bg-primary px-4 py-1.5 text-sm text-white disabled:opacity-50"
          >
            {createValue.isPending ? '添加中...' : '添加'}
          </button>
        </div>
        {addError && (
          <div id="values-form-error" className="mt-3 rounded-lg border border-warning/30 bg-warning/5 p-2 text-sm text-warning" role="alert">
            {addError}
          </div>
        )}
      </form>

      {error ? (
        <EmptyState variant="error" message={`加载失败: ${error.message}`} />
      ) : isLoading ? (
        <div className="space-y-2">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      ) : values && values.length > 0 ? (
        <div className="space-y-2">
          {values.map(v => (
            <div key={v.id} className="flex flex-col gap-2 rounded-xl border border-border bg-surface-elevated p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-medium">{v.label}</span>
                <span className="ml-2 text-sm text-text-secondary">ID: {v.id}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-border" role="progressbar" aria-valuenow={v.weight * 100} aria-valuemin={0} aria-valuemax={100} aria-label={`${v.label} 权重`}>
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${v.weight * 100}%` }} />
                </div>
                <span className="w-10 text-right text-sm font-medium">{v.weight.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="尚未添加价值观" />
      )}
    </>
  );
}
