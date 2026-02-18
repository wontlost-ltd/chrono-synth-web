import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../components/layout/PageHeader';
import { MetricCard } from '../components/ui/MetricCard';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { LiveIndicator } from '../components/ui/LiveIndicator';
import { LiveMetricStream } from '../components/charts/LiveMetricStream';
import { useOverview } from '../api/queries/visualization';
import { useWebSocket } from '../hooks/useWebSocket';

export function Dashboard() {
  const { t } = useTranslation();
  const [simId, setSimId] = useState(() => {
    try { return localStorage.getItem('last-sim-id') ?? ''; } catch { return ''; }
  });
  const { data, isLoading, error } = useOverview(simId);
  const ws = useWebSocket({ autoConnect: !!simId });

  if (!simId) {
    return (
      <>
        <PageHeader title={t('dashboard.title')} />
        <div className="mb-4">
          <label htmlFor="sim-id-input" className="text-sm text-text-secondary">{t('dashboard.inputLabel')}</label>
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
              placeholder={t('dashboard.simIdPlaceholder')}
            />
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm text-white">
              {t('dashboard.load')}
            </button>
          </form>
        </div>
        <EmptyState
          message={t('dashboard.emptyState')}
          action={<Link to="/simulations/new" className="rounded-lg bg-primary px-4 py-2 text-sm text-white">{t('dashboard.createNew')}</Link>}
        />
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title={t('dashboard.title')} />
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
        <PageHeader title={t('dashboard.title')} />
        <EmptyState
          variant={error ? 'error' : 'empty'}
          message={error ? t('dashboard.loadError', { message: error.message }) : t('dashboard.noData')}
          action={<button type="button" onClick={() => setSimId('')} className="text-sm text-primary underline">{t('dashboard.reselect')}</button>}
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
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle', { id: data.simulationId.slice(0, 20), years: data.meta.horizonYears })}
        actions={
          <div className="flex items-center gap-3">
            <LiveIndicator status={ws.status} />
            <button
              type="button"
              onClick={() => { setSimId(''); try { localStorage.removeItem('last-sim-id'); } catch { /* ignored */ } }}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-surface"
            >
              {t('dashboard.switchSimulation')}
            </button>
          </div>
        }
      />

      {/* 推荐路径 */}
      {recommended && (
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs font-medium text-primary">{t('dashboard.recommendedPath')}</span>
              <h2 className="text-lg font-bold">{recommended.pathId}</h2>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-secondary">{t('dashboard.compositeScore')}</div>
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
        {confidence != null && <MetricCard title={t('dashboard.confidence')} value={confidence} unit="" />}
        {recommended && <MetricCard title={t('dashboard.regretProbability')} value={recommended.regretProbability} unit="" />}
      </div>

      {/* 回顾分析 */}
      {retroSummary && (
        <div className="mt-6 rounded-xl border border-border bg-surface-elevated p-4">
          <h3 className="mb-2 text-sm font-medium text-text-secondary">{t('dashboard.retrospective')}</h3>
          <p className="text-sm leading-relaxed">{retroSummary}</p>
        </div>
      )}

      {/* 实时事件流 */}
      <div className="mt-6 rounded-xl border border-border bg-surface-elevated p-4">
        <h3 className="mb-3 text-sm font-medium text-text-secondary">{t('dashboard.liveEvents')}</h3>
        <LiveMetricStream subscribe={ws.subscribe} status={ws.status} />
      </div>

      {/* 导航操作 */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to={`/simulations/${encodeURIComponent(simId)}/paths`} className="rounded-lg bg-primary px-4 py-2 text-sm text-white">
          {t('dashboard.comparePaths')}
        </Link>
        <Link to={`/simulations/${encodeURIComponent(simId)}/branches`} className="rounded-lg border border-border px-4 py-2 text-sm">
          {t('dashboard.viewBranches')}
        </Link>
        <Link to={`/simulations/${encodeURIComponent(simId)}/stress`} className="rounded-lg border border-border px-4 py-2 text-sm">
          {t('dashboard.stressTest')}
        </Link>
        <Link to={`/simulations/${encodeURIComponent(simId)}/milestones`} className="rounded-lg border border-border px-4 py-2 text-sm">
          {t('dashboard.milestones')}
        </Link>
      </div>
    </>
  );
}
