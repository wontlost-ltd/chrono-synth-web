import type { ConflictInboxItemV1 } from '@chrono/contracts';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { useConflictInbox, type ConflictAction } from './useConflictInbox';

const ACTION_LABELS: Record<ConflictAction, string> = {
  keep_local: '保留本地',
  keep_server: '保留服务器',
  duplicate: '创建副本',
  merge_manually: '手动合并',
};

const SEVERITY_CLASS: Record<ConflictInboxItemV1['severity'], string> = {
  blocking: 'bg-error/10 text-error',
  warning: 'bg-warning/10 text-warning',
};

function formatParams(params: ConflictInboxItemV1['localSummaryParams']): string {
  const entries = Object.entries(params);
  if (entries.length === 0) return '{}';
  return entries.map(([key, value]) => `${key}: ${value}`).join(', ');
}

function ConflictRow({
  item,
  resolving,
  onResolve,
}: {
  item: ConflictInboxItemV1;
  resolving: boolean;
  onResolve: (action: ConflictAction) => void;
}) {
  return (
    <li className="rounded-lg border border-border bg-surface-elevated p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary">
              {item.entityType} / {item.entityId}
            </h3>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_CLASS[item.severity]}`}>
              {item.severity}
            </span>
          </div>
          <p className="mt-1 text-xs text-text-secondary">
            {item.sourceRuntime} · {new Date(item.detectedAt).toLocaleString()}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {item.suggestedActions.map((action) => (
            <button
              key={action}
              type="button"
              disabled={resolving}
              onClick={() => onResolve(action)}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resolving ? '处理中' : ACTION_LABELS[action]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-md bg-surface p-3">
          <p className="text-xs font-medium text-text-secondary">{item.localSummaryId}</p>
          <p className="mt-1 break-words text-sm text-text-primary">{formatParams(item.localSummaryParams)}</p>
        </div>
        <div className="rounded-md bg-surface p-3">
          <p className="text-xs font-medium text-text-secondary">{item.serverSummaryId}</p>
          <p className="mt-1 break-words text-sm text-text-primary">{formatParams(item.serverSummaryParams)}</p>
        </div>
      </div>
    </li>
  );
}

export function ConflictInboxPage() {
  const { conflicts, loading, resolving, resolve, refresh } = useConflictInbox();

  return (
    <>
      <PageHeader title="冲突收件箱" subtitle="处理跨运行时同步冲突" />

      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={refresh}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-surface"
        >
          刷新
        </button>
      </div>

      {loading ? (
        <Skeleton variant="table" />
      ) : conflicts.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface-elevated p-6 text-sm text-text-secondary">
          没有待处理的冲突
        </div>
      ) : (
        <ul className="space-y-3">
          {conflicts.map((item) => (
            <ConflictRow
              key={item.conflictId}
              item={item}
              resolving={resolving === item.conflictId}
              onResolve={(action) => {
                void resolve(item.conflictId, item.conflictVersion, action);
              }}
            />
          ))}
        </ul>
      )}
    </>
  );
}

export default ConflictInboxPage;
