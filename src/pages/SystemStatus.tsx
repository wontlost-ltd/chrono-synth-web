import { PageHeader } from '../components/layout/PageHeader';
import { Skeleton } from '../components/ui/Skeleton';
import { useHealthz, useReadyz, usePosSummary } from '../api/queries/system';

export function SystemStatus() {
  const healthz = useHealthz();
  const readyz = useReadyz();
  const posSummary = usePosSummary();

  return (
    <>
      <PageHeader title="系统状态" subtitle="API 健康检查和人格状态" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* 健康检查 */}
        <div className="rounded-xl border border-border bg-surface-elevated p-4">
          <h3 className="mb-2 text-sm font-medium text-text-secondary">/healthz</h3>
          {healthz.isLoading ? (
            <Skeleton variant="card" />
          ) : healthz.error ? (
            <div className="text-sm text-warning">不可达</div>
          ) : (
            <div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                healthz.data?.status === 'ok' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${healthz.data?.status === 'ok' ? 'bg-success' : 'bg-warning'}`} />
                {healthz.data?.status ?? '未知'}
              </span>
              {healthz.data?.uptime != null && (
                <p className="mt-1 text-xs text-text-secondary">
                  运行时间: {(healthz.data.uptime / 1000).toFixed(0)}s
                </p>
              )}
            </div>
          )}
        </div>

        {/* 就绪检查 */}
        <div className="rounded-xl border border-border bg-surface-elevated p-4">
          <h3 className="mb-2 text-sm font-medium text-text-secondary">/readyz</h3>
          {readyz.isLoading ? (
            <Skeleton variant="card" />
          ) : readyz.error ? (
            <div className="text-sm text-warning">不可达</div>
          ) : (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
              readyz.data?.status === 'ok' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${readyz.data?.status === 'ok' ? 'bg-success' : 'bg-warning'}`} />
              {readyz.data?.status ?? '未知'}
            </span>
          )}
        </div>

        {/* API 文档链接 */}
        <div className="rounded-xl border border-border bg-surface-elevated p-4">
          <h3 className="mb-2 text-sm font-medium text-text-secondary">API 文档</h3>
          <a
            href="/api/v1/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline"
          >
            /api/v1/docs
          </a>
        </div>
      </div>

      {/* 人格状态摘要 */}
      <div className="mt-6 rounded-xl border border-border bg-surface-elevated p-4">
        <h3 className="mb-3 text-sm font-medium text-text-secondary">人格状态摘要</h3>
        {posSummary.isLoading ? (
          <Skeleton variant="table" />
        ) : posSummary.error ? (
          <p className="text-sm text-text-secondary">无法获取人格状态</p>
        ) : (
          <pre className="whitespace-pre-wrap rounded-lg bg-surface p-3 text-xs leading-relaxed">
            {typeof posSummary.data?.summary === 'string'
              ? posSummary.data.summary
              : JSON.stringify(posSummary.data, null, 2)}
          </pre>
        )}
      </div>
    </>
  );
}
