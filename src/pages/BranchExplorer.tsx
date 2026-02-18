import { useState, useMemo } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { SankeyGraph } from '../components/charts/SankeyGraph';
import { RadioGroup } from '../components/ui/RadioGroup';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useBranches } from '../api/queries/visualization';
import { useOverview } from '../api/queries/visualization';
import { useSimulationId } from '../hooks/useSimulationId';

export function BranchExplorer() {
  const simId = useSimulationId();
  const { data: overview } = useOverview(simId);
  const pathIds = useMemo(() => overview?.paths.map(p => p.pathId) ?? [], [overview]);
  const [pathId, setPathId] = useState<string>('');

  const selectedPathId = pathId || pathIds[0] || '';
  const { data, isLoading, error } = useBranches(simId, selectedPathId);

  const pathOptions = pathIds.map(id => ({ value: id, label: id }));

  return (
    <>
      <PageHeader title="分支结构" subtitle="路径分支概率可视化" />

      {pathIds.length > 1 && (
        <RadioGroup
          options={pathOptions}
          value={selectedPathId}
          onChange={setPathId}
          label="路径选择"
          className="mb-4"
        />
      )}

      {error ? (
        <EmptyState variant="error" message={`加载失败: ${error.message}`} />
      ) : isLoading ? (
        <Skeleton variant="chart" />
      ) : data ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface-elevated p-4 lg:col-span-2">
            <h3 className="mb-3 text-sm font-medium text-text-secondary">分支概率图</h3>
            {data.graph.nodes.length > 0 ? (
              <SankeyGraph
                nodes={data.graph.nodes.map(n => ({ id: n.id, label: n.label }))}
                edges={data.graph.edges}
              />
            ) : (
              <EmptyState message="无分支数据" />
            )}
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-surface-elevated p-4">
              <h3 className="mb-2 text-sm font-medium text-text-secondary">路径信息</h3>
              <p className="text-lg font-bold">{data.label}</p>
              <p className="text-sm text-text-secondary">时间跨度: {data.horizonYears} 年</p>
              <p className="text-sm text-text-secondary">分支点: Y{data.pivotYear}</p>
            </div>
            {data.branches.map(br => (
              <div key={br.label} className="rounded-xl border border-border bg-surface-elevated p-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-medium">{br.label}</span>
                  <span className="text-sm text-text-secondary">{(br.probability * 100).toFixed(0)}%</span>
                </div>
                <p className="mt-1 text-sm text-text-secondary">
                  综合评分: {br.compositeScore.toFixed(3)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState message="选择路径以查看分支结构" />
      )}
    </>
  );
}
