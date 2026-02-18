import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { MilestoneTimeline } from '../components/charts/MilestoneTimeline';
import { MetricSelector } from '../components/ui/MetricSelector';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useMilestones } from '../api/queries/visualization';
import { useSimulationId } from '../hooks/useSimulationId';
import type { MetricKey } from '../types';

export function Milestones() {
  const simId = useSimulationId();
  const [metrics, setMetrics] = useState<MetricKey[]>(['wealth', 'healthIndex']);
  const metricsParam = metrics.join(',');
  const { data, isLoading, error } = useMilestones(simId, metricsParam);

  return (
    <>
      <PageHeader title="里程碑" subtitle="关键时间节点事件" />

      <div className="mb-4">
        <MetricSelector selected={metrics} onChange={setMetrics} metricMeta={data?.metricMeta} />
      </div>

      {error ? (
        <EmptyState variant="error" message={`加载失败: ${error.message}`} />
      ) : isLoading ? (
        <Skeleton variant="chart" />
      ) : data && data.milestones.length > 0 ? (
        <div className="space-y-6">
          {data.milestones.map(m => (
            <div key={m.pathId} className="rounded-xl border border-border bg-surface-elevated p-4">
              <h3 className="mb-3 font-medium">{m.label}</h3>
              {m.events.length > 0 ? (
                <MilestoneTimeline events={m.events} />
              ) : (
                <p className="text-sm text-text-secondary">此路径无里程碑事件</p>
              )}

              {/* 起终点快照 */}
              <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-3">
                <div>
                  <span className="text-xs text-text-secondary">起点</span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(m.summary.startSnapshot).map(([k, v]) => (
                      <span key={k} className="rounded bg-surface px-2 py-0.5 text-xs">
                        {k}: {typeof v === 'number' ? v.toFixed(2) : v}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-text-secondary">终点</span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(m.summary.endSnapshot).map(([k, v]) => (
                      <span key={k} className="rounded bg-surface px-2 py-0.5 text-xs">
                        {k}: {typeof v === 'number' ? v.toFixed(2) : v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="无里程碑数据" />
      )}
    </>
  );
}
