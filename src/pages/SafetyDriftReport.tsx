/**
 * AI 安全 / 人格漂移报告 (T0-B)
 * 后端：POST /api/v1/admin/safety/drift-report 触发分析
 *      GET  /api/v1/admin/safety/drift-report 拉取最近一份
 *      GET  /api/v1/admin/safety/status       聚合视图
 */

import { useTranslation } from 'react-i18next';
import { PageHeader } from '../components/layout/PageHeader';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuth } from '../hooks/useAuth';
import {
  useLatestDriftReport,
  useGenerateDriftReport,
  useSafetyStatus,
  type DriftAlertLevel,
} from '../api/queries/safety';

const ALERT_BADGE_STATUS: Record<DriftAlertLevel, 'completed' | 'paused' | 'error'> = {
  ok: 'completed',
  warning: 'paused',
  critical: 'error',
};

const ALERT_LABEL: Record<DriftAlertLevel, string> = {
  ok: 'OK',
  warning: 'Warning',
  critical: 'Critical',
};

function formatTimestamp(ms: number): string {
  if (!ms) return '—';
  return new Date(ms).toLocaleString();
}

function formatDelta(d: number): string {
  return `${d >= 0 ? '+' : ''}${d.toFixed(3)}`;
}

export function SafetyDriftReport() {
  const { t } = useTranslation();
  useDocumentTitle('AI 安全 — 漂移监测');
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const status = useSafetyStatus(isAdmin);
  const latest = useLatestDriftReport(isAdmin);
  const generate = useGenerateDriftReport();

  if (!isAdmin) {
    return <EmptyState variant="error" message={t('adminConfig.noPermission')} />;
  }

  const isLoading = status.isLoading || latest.isLoading;
  if (isLoading) return <Skeleton variant="card" />;

  const summary = status.data;
  const report = latest.data ?? summary?.drift.latestReport ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI 安全 / 人格漂移监测"
        subtitle="对比最近两次快照的价值权重变化；超过阈值时写审计 + 触发 webhook"
        actions={
          <button
            type="button"
            className="rounded bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary-light disabled:opacity-50"
            disabled={generate.isPending}
            onClick={() => generate.mutate()}
          >
            {generate.isPending ? '分析中…' : '立即生成报告'}
          </button>
        }
      />

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border p-4">
            <div className="text-xs uppercase text-text-secondary">安全评分</div>
            <div className="mt-1 text-3xl font-bold">{summary.safetyScore}/100</div>
          </div>
          <div className="rounded-xl border border-border p-4">
            <div className="text-xs uppercase text-text-secondary">未验证记忆</div>
            <div className="mt-1 text-3xl font-bold">
              {summary.memoryConfidence.unverifiedCount}
              <span className="text-base font-normal text-text-secondary">
                /{summary.memoryConfidence.total}
              </span>
            </div>
            <p className="mt-1 text-xs text-text-secondary">低置信度或来源未知</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <div className="text-xs uppercase text-text-secondary">近期告警 (≠ ok)</div>
            <div className="mt-1 text-3xl font-bold">{summary.drift.recentAlerts.length}</div>
            <p className="mt-1 text-xs text-text-secondary">最近 10 条非正常状态</p>
          </div>
        </div>
      )}

      {!report && (
        <EmptyState
          message="尚未生成漂移报告。点击右上角「立即生成报告」开始第一次分析。"
        />
      )}

      {report && (
        <section className="border rounded-lg p-4 space-y-3">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">最近报告</h2>
              <p className="text-sm text-text-secondary">
                生成于 {formatTimestamp(report.analyzedAt)} · 基线 {report.baselineSnapshotId ?? '—'}
              </p>
            </div>
            <StatusBadge
              status={ALERT_BADGE_STATUS[report.alertLevel]}
              label={ALERT_LABEL[report.alertLevel]}
            />
          </header>

          <div className="text-sm">
            综合漂移分：<strong>{report.overallDriftScore.toFixed(3)}</strong>
            {report.alertEmitted ? (
              <span className="ml-2 text-warning">告警已写入审计 (auditId={report.auditId})</span>
            ) : null}
          </div>

          {report.valueDrifts.length === 0 ? (
            <p className="text-sm text-text-secondary">
              本次分析没有可对比的价值变化（可能只有一份快照）。
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left border-b">
                <tr>
                  <th className="py-2">价值</th>
                  <th className="py-2">基线</th>
                  <th className="py-2">当前</th>
                  <th className="py-2">变化</th>
                  <th className="py-2">告警</th>
                </tr>
              </thead>
              <tbody>
                {report.valueDrifts.map((d) => (
                  <tr key={d.valueId} className="border-b">
                    <td className="py-2 font-mono text-xs">{d.label || d.valueId}</td>
                    <td className="py-2">{d.baseline.toFixed(3)}</td>
                    <td className="py-2">{d.current.toFixed(3)}</td>
                    <td className="py-2 font-mono">{formatDelta(d.delta)}</td>
                    <td className="py-2">
                      <StatusBadge
                        status={ALERT_BADGE_STATUS[d.alertLevel]}
                        label={ALERT_LABEL[d.alertLevel]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {summary && summary.drift.recentAlerts.length > 0 && (
        <section className="border rounded-lg p-4 space-y-2">
          <h2 className="text-lg font-semibold">最近告警</h2>
          <ul className="text-sm space-y-1">
            {summary.drift.recentAlerts.map((a) => (
              <li key={a.reportId} className="flex items-center gap-3">
                <span className="font-mono text-xs flex-1 truncate">{a.reportId}</span>
                <span className="text-text-secondary">{formatTimestamp(a.analyzedAt)}</span>
                <StatusBadge
                  status={ALERT_BADGE_STATUS[a.alertLevel]}
                  label={ALERT_LABEL[a.alertLevel]}
                />
                <span className="font-mono w-20 text-right">{a.overallDriftScore.toFixed(3)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
