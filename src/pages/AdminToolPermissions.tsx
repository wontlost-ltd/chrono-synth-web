/**
 * Tool Permissions admin page (P3-A).
 *
 * Lists all tool_permissions for the tenant; supports grant + revoke +
 * filter-by-persona inline. Doesn't expose all constraints — keeps the
 * common subset (maxActionsPerDay, requireConfirmation) and points
 * admins at the API for advanced shapes.
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../components/layout/PageHeader';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuth } from '../hooks/useAuth';
import {
  useToolPermissions,
  useGrantToolPermission,
  useRevokeToolPermission,
  type ToolPermission,
  type ToolScope,
} from '../api/queries/agent-tools';

function formatTimestamp(ms: number | null): string {
  if (!ms) return '—';
  return new Date(ms).toLocaleString();
}

function permissionStatus(p: ToolPermission): 'active' | 'paused' | 'error' | 'completed' {
  if (p.revokedAt !== null) return 'error';
  if (p.expiresAt !== null && p.expiresAt < Date.now()) return 'paused';
  return 'active';
}

function permissionStatusLabel(p: ToolPermission): string {
  if (p.revokedAt !== null) return 'Revoked';
  if (p.expiresAt !== null && p.expiresAt < Date.now()) return 'Expired';
  return 'Active';
}

export function AdminToolPermissions() {
  const { t } = useTranslation();
  useDocumentTitle('工具权限');
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const list = useToolPermissions(isAdmin);
  const grant = useGrantToolPermission();
  const revoke = useRevokeToolPermission();

  const [filterPersona, setFilterPersona] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'revoked'>('all');
  const [showGrantForm, setShowGrantForm] = useState(false);

  if (!isAdmin) return <EmptyState variant="error" message={t('adminConfig.noPermission')} />;
  if (list.isLoading) return <Skeleton variant="card" />;
  if (list.error) {
    return <EmptyState variant="error" message={`加载失败：${(list.error as Error).message}`} />;
  }

  const rows = (list.data ?? []).filter((p) => {
    if (filterPersona && !p.personaId.includes(filterPersona)) return false;
    if (filterStatus === 'active' && p.revokedAt !== null) return false;
    if (filterStatus === 'revoked' && p.revokedAt === null) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="工具权限"
        subtitle="管理 (persona, tool) 粒度的执行授权；revocation 是 soft delete，可追溯"
        actions={
          <button
            type="button"
            className="rounded bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary-light disabled:opacity-50"
            onClick={() => setShowGrantForm((v) => !v)}
          >
            {showGrantForm ? '取消' : '授予权限'}
          </button>
        }
      />

      {showGrantForm && (
        <GrantPermissionForm
          isPending={grant.isPending}
          error={grant.error}
          onCancel={() => setShowGrantForm(false)}
          onSubmit={async (input) => {
            await grant.mutateAsync(input);
            setShowGrantForm(false);
          }}
        />
      )}

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <input
          type="text"
          className="rounded border border-border bg-surface px-2 py-1"
          placeholder="按 personaId 过滤"
          value={filterPersona}
          onChange={(e) => setFilterPersona(e.target.value)}
        />
        <select
          className="rounded border border-border bg-surface px-2 py-1"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
        >
          <option value="all">全部</option>
          <option value="active">仅活跃</option>
          <option value="revoked">仅已撤销</option>
        </select>
        <span className="text-text-secondary">{rows.length} / {list.data?.length ?? 0} 条</span>
      </div>

      {rows.length === 0 ? (
        <EmptyState message="没有匹配的权限。" />
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left border-b border-border bg-surface">
              <tr>
                <th className="p-3">Persona</th>
                <th className="p-3">Tool</th>
                <th className="p-3">Scope</th>
                <th className="p-3">Constraints</th>
                <th className="p-3">Granted</th>
                <th className="p-3">Expires</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="p-3 font-mono text-xs">{p.personaId}</td>
                  <td className="p-3 font-mono text-xs">{p.toolId}</td>
                  <td className="p-3">{p.scope}</td>
                  <td className="p-3 font-mono text-xs">
                    {summarizeConstraints(p.constraints)}
                  </td>
                  <td className="p-3 text-xs">{formatTimestamp(p.grantedAt)}</td>
                  <td className="p-3 text-xs">{formatTimestamp(p.expiresAt)}</td>
                  <td className="p-3">
                    <StatusBadge status={permissionStatus(p)} label={permissionStatusLabel(p)} />
                  </td>
                  <td className="p-3">
                    {p.revokedAt === null && (
                      <button
                        type="button"
                        className="text-xs text-warning hover:underline"
                        disabled={revoke.isPending}
                        onClick={() => {
                          const reason = window.prompt('撤销原因（必填）');
                          if (!reason) return;
                          revoke.mutate({ id: p.id, reason });
                        }}
                      >
                        撤销
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function summarizeConstraints(c: ToolPermission['constraints']): string {
  const parts: string[] = [];
  if (c.maxActionsPerDay !== undefined) parts.push(`max/d=${c.maxActionsPerDay}`);
  if (c.requireConfirmation) parts.push('confirm');
  if (c.budgetLimitCents !== undefined) parts.push(`$${(c.budgetLimitCents / 100).toFixed(2)}`);
  if (c.allowList?.length) parts.push(`allow:${c.allowList.length}`);
  if (c.denyList?.length) parts.push(`deny:${c.denyList.length}`);
  return parts.length === 0 ? '—' : parts.join(' · ');
}

interface GrantFormProps {
  isPending: boolean;
  error: unknown;
  onCancel: () => void;
  onSubmit: (input: {
    personaId: string;
    toolId: string;
    scope: ToolScope;
    constraints?: ToolPermission['constraints'];
    expiresAt?: number | null;
  }) => Promise<void>;
}

function GrantPermissionForm({ isPending, error, onCancel, onSubmit }: GrantFormProps) {
  const [personaId, setPersonaId] = useState('');
  const [toolId, setToolId] = useState('');
  const [scope, setScope] = useState<ToolScope>('execute');
  const [maxPerDay, setMaxPerDay] = useState('');
  const [requireConfirm, setRequireConfirm] = useState(false);
  const errorMsg = useMemo(() => (error instanceof Error ? error.message : null), [error]);

  return (
    <form
      className="rounded-xl border border-border p-4 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const constraints: ToolPermission['constraints'] = {};
        if (maxPerDay) constraints.maxActionsPerDay = parseInt(maxPerDay, 10);
        if (requireConfirm) constraints.requireConfirmation = true;
        void onSubmit({ personaId, toolId, scope, constraints });
      }}
    >
      <h2 className="text-base font-semibold">授予工具权限</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-xs text-text-secondary">Persona ID</span>
          <input
            required
            className="w-full rounded border border-border bg-surface px-2 py-1 text-sm"
            value={personaId}
            onChange={(e) => setPersonaId(e.target.value)}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-text-secondary">Tool ID（如 web_search / calendar / email.send）</span>
          <input
            required
            className="w-full rounded border border-border bg-surface px-2 py-1 text-sm"
            value={toolId}
            onChange={(e) => setToolId(e.target.value)}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-text-secondary">Scope</span>
          <select
            className="w-full rounded border border-border bg-surface px-2 py-1 text-sm"
            value={scope}
            onChange={(e) => setScope(e.target.value as ToolScope)}
          >
            <option value="read">read</option>
            <option value="write">write</option>
            <option value="execute">execute</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs text-text-secondary">每日最大调用（可选）</span>
          <input
            type="number"
            min="1"
            className="w-full rounded border border-border bg-surface px-2 py-1 text-sm"
            value={maxPerDay}
            onChange={(e) => setMaxPerDay(e.target.value)}
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={requireConfirm}
          onChange={(e) => setRequireConfirm(e.target.checked)}
        />
        <span>调用时强制二次确认（高风险工具自动启用）</span>
      </label>
      {errorMsg && <p className="text-xs text-warning">{errorMsg}</p>}
      <div className="flex gap-2">
        <button type="submit" className="rounded bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary-light disabled:opacity-50" disabled={isPending}>
          {isPending ? '提交中…' : '授予'}
        </button>
        <button type="button" className="rounded px-3 py-1.5 text-sm text-text-secondary hover:bg-surface" onClick={onCancel}>
          取消
        </button>
      </div>
    </form>
  );
}
