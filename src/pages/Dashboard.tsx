import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { MetricCard } from '../components/ui/MetricCard';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useOverview } from '../api/queries/visualization';

export function Dashboard() {
  const [simId, setSimId] = useState(() => {
    try { return localStorage.getItem('last-sim-id') ?? ''; } catch { return ''; }
  });
  const { data, isLoading, error } = useOverview(simId);

  if (!simId) {
    return (
      <>
        <PageHeader title="人生模拟仪表盘" />
        <div className="mb-4">
          <label htmlFor="sim-id-input" className="text-sm text-text-secondary">输入模拟 ID:</label>
          <form className="mt-1 flex gap-2" onSubmit={e => {
            e.preventDefault();
            const form = e.currentTarget;
            const val = (form.elements.namedItem('sim-id') as HTMLInputElement).value.trim();
            if (val) { setSimId(val); try { localStorage.setItem('last-sim-id', val); } catch { /* ignored */ }; }
          }}>
            <input
              id="sim-id-input"
              name="sim-id"
              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
              placeholder="lsim_..."
            />
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm text-white">
              加载
            </button>
          </form>
        </div>
        <EmptyState
          message="尚未选择模拟"
          action={<Link to="/simulations/new" className="rounded-lg bg-primary px-4 py-2 text-sm text-white">创建新模拟</Link>}
        />
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="人生模拟仪表盘" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
        <Skeleton variant="chart" className="mt-4" />
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <PageHeader title="人生模拟仪表盘" />
        <EmptyState
          variant={error ? 'error' : 'empty'}
          message={error ? `加载失败: ${error.message}` : '无数据'}
          action={<button type="button" onClick={() => setSimId('')} className="text-sm text-primary underline">重新选择</button>}
        />
      </>
    );
  }

  const recommended = data.paths.find(p => p.pathId === data.recommendedPathId);
  const retro = data.retrospective as { summary?: string; confidence?: number; regretByPath?: Record<string, number> } | string | undefined;
  const retroSummary = typeof retro === 'string' ? retro : retro?.summary ?? '';
  const confidence = typeof retro === 'object' ? retro?.confidence : undefined;

  return (
    <>
      <PageHeader
        title="人生模拟仪表盘"
        subtitle={`模拟 ${data.simulationId.slice(0, 20)}... · ${data.meta.horizonYears} 年`}
        actions={
          <button
            type="button"
            onClick={() => { setSimId(''); try { localStorage.removeItem('last-sim-id'); } catch { /* ignored */ } }}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-surface"
          >
            切换模拟
          </button>
        }
      />

      {/* 推荐路径 */}
      {recommended && (
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs font-medium text-primary">推荐路径</span>
              <h2 className="text-lg font-bold">{recommended.pathId}</h2>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-secondary">综合评分</div>
              <div className="text-xl font-bold">{recommended.compositeScore.toFixed(3)}</div>
            </div>
          </div>
        </div>
      )}

      {/* 关键指标 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.paths.map(p => (
          <MetricCard
            key={p.pathId}
            title={p.label ?? p.pathId}
            value={p.compositeScore}
            unit=""
          />
        ))}
        {confidence != null && <MetricCard title="置信度" value={confidence} unit="" />}
        {recommended && <MetricCard title="后悔概率" value={recommended.regretProbability} unit="" />}
      </div>

      {/* 回顾分析 */}
      {retroSummary && (
        <div className="mt-6 rounded-xl border border-border bg-surface-elevated p-4">
          <h3 className="mb-2 text-sm font-medium text-text-secondary">回顾分析</h3>
          <p className="text-sm leading-relaxed">{retroSummary}</p>
        </div>
      )}

      {/* 导航操作 */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to={`/simulations/${encodeURIComponent(simId)}/paths`} className="rounded-lg bg-primary px-4 py-2 text-sm text-white">
          对比路径
        </Link>
        <Link to={`/simulations/${encodeURIComponent(simId)}/branches`} className="rounded-lg border border-border px-4 py-2 text-sm">
          查看分支
        </Link>
        <Link to={`/simulations/${encodeURIComponent(simId)}/stress`} className="rounded-lg border border-border px-4 py-2 text-sm">
          压力测试
        </Link>
        <Link to={`/simulations/${encodeURIComponent(simId)}/milestones`} className="rounded-lg border border-border px-4 py-2 text-sm">
          里程碑
        </Link>
      </div>
    </>
  );
}
