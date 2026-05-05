/**
 * 待确认调用列表 (F3).
 *
 * 当 persona 试图执行 highRisk 工具（如 email.send / calendar.create）
 * 而 confirmationToken 缺失时，pipeline 会发出一个 pending_confirmation
 * invocation。这个页面让用户审批/拒绝。
 *
 * 设计取舍：approve 需要重放原始 arguments — 后端不持久化 args
 * 避免 PII；UI 提示用户从 audit_log 或 LLM 历史中复制原始 JSON。
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../components/layout/PageHeader';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  usePendingConfirmations,
  useApproveConfirmation,
  useRejectConfirmation,
  type PendingConfirmation,
} from '../api/queries/agent-confirmations';

function formatTs(ms: number): string {
  if (!ms) return '—';
  return new Date(ms).toLocaleString();
}

export function AgentPendingConfirmations() {
  const { t: _t } = useTranslation();
  useDocumentTitle('待我审批');
  const list = usePendingConfirmations(20);
  const [activeApproval, setActiveApproval] = useState<PendingConfirmation | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="待我审批"
        subtitle="高风险工具调用必须经过你的二次确认才会真正执行；30 秒内可撤销整个授权"
      />

      {list.isLoading ? (
        <Skeleton variant="card" />
      ) : list.error ? (
        <EmptyState variant="error" message={`加载失败：${(list.error as Error).message}`} />
      ) : (list.data ?? []).length === 0 ? (
        <EmptyState message="没有待审批的工具调用。" />
      ) : (
        <ul className="space-y-3">
          {list.data!.map((c) => (
            <PendingItem
              key={c.invocationId}
              item={c}
              onApprove={() => setActiveApproval(c)}
            />
          ))}
        </ul>
      )}

      {activeApproval && (
        <ApproveDialog
          item={activeApproval}
          onClose={() => setActiveApproval(null)}
        />
      )}
    </div>
  );
}

interface ItemProps {
  item: PendingConfirmation;
  onApprove: () => void;
}

function PendingItem({ item, onApprove }: ItemProps) {
  const reject = useRejectConfirmation();
  return (
    <li className="rounded-xl border border-border bg-surface-elevated p-4 space-y-2">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs">{item.toolId}</span>
          <StatusBadge status="paused" label="待确认" />
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            className="rounded bg-primary px-3 py-1 text-xs text-white hover:bg-primary-light"
            onClick={onApprove}
          >
            审批
          </button>
          <button
            type="button"
            className="text-xs text-warning hover:underline"
            disabled={reject.isPending}
            onClick={() => {
              if (!item.confirmationTokenId) return;
              const reason = window.prompt('拒绝原因（可选）') ?? 'user_rejected';
              reject.mutate({ tokenId: item.confirmationTokenId, reason });
            }}
          >
            拒绝
          </button>
        </div>
      </header>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-text-secondary">
        <div>Persona：<span className="font-mono">{item.personaId}</span></div>
        <div>Invoker：<span className="font-mono">{item.invokerType}</span></div>
        <div>触发：{formatTs(item.invokedAt)}</div>
        <div>Input hash：<span className="font-mono">{item.inputHash.slice(0, 16)}…</span></div>
      </div>
    </li>
  );
}

interface ApproveDialogProps {
  item: PendingConfirmation;
  onClose: () => void;
}

function ApproveDialog({ item, onClose }: ApproveDialogProps) {
  const approve = useApproveConfirmation();
  const [argsJson, setArgsJson] = useState('{\n  \n}');
  const [parseError, setParseError] = useState<string | null>(null);

  const handleSubmit = async () => {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(argsJson);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('arguments 必须是 JSON 对象');
      }
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'JSON 解析失败');
      return;
    }
    setParseError(null);
    if (!item.confirmationTokenId) return;
    try {
      await approve.mutateAsync({ tokenId: item.confirmationTokenId, arguments: parsed });
      onClose();
    } catch {
      /* error message rendered below */
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface-elevated p-4 space-y-3">
        <h2 className="text-base font-semibold">审批工具调用</h2>
        <div className="text-sm space-y-1">
          <p><strong>Tool：</strong> <span className="font-mono">{item.toolId}</span></p>
          <p><strong>Persona：</strong> <span className="font-mono">{item.personaId}</span></p>
          <p className="text-xs text-text-secondary">
            后端为隐私保护不会持久化 arguments；请粘贴最初触发本次调用的参数 JSON。input_hash 不匹配会拒绝。
          </p>
        </div>
        <textarea
          className="w-full rounded border border-border bg-surface px-2 py-1 font-mono text-xs"
          rows={8}
          value={argsJson}
          onChange={(e) => setArgsJson(e.target.value)}
        />
        {parseError && <p className="text-xs text-warning">{parseError}</p>}
        {approve.error && (
          <p className="text-xs text-warning">提交失败：{(approve.error as Error).message}</p>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded px-3 py-1.5 text-sm text-text-secondary hover:bg-surface"
            onClick={onClose}
          >
            取消
          </button>
          <button
            type="button"
            className="rounded bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary-light disabled:opacity-50"
            disabled={approve.isPending}
            onClick={handleSubmit}
          >
            {approve.isPending ? '执行中…' : '执行'}
          </button>
        </div>
      </div>
    </div>
  );
}
