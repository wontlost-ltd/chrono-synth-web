/**
 * 用户级 Google OAuth 授权管理 (F2).
 *
 * 不同于其他 admin 页：这是终端用户自己管理自己的 Google 凭据，所有
 * 登录用户都能访问。授权流程会跳出当前域到 Google 同意页，回来时由
 * 后端的 callback 路由 /api/v1/agent/oauth/google/callback 处理。
 */

import { useTranslation } from 'react-i18next';
import { PageHeader } from '../components/layout/PageHeader';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  useUserOauthTokens,
  useStartGoogleAuthorize,
  useRevokeGoogleToken,
  GOOGLE_SCOPES,
  type UserOauthTokenMeta,
} from '../api/queries/agent-oauth';

function formatTs(ms: number | null): string {
  return ms ? new Date(ms).toLocaleString() : '—';
}

function tokenStatus(t: UserOauthTokenMeta): 'active' | 'paused' | 'error' {
  if (t.revokedAt !== null) return 'error';
  if (t.accessExpiresAt < Date.now()) return 'paused';
  return 'active';
}

function tokenStatusLabel(t: UserOauthTokenMeta): string {
  if (t.revokedAt !== null) return 'Revoked';
  if (t.accessExpiresAt < Date.now()) return 'Expired (refresh on next call)';
  return 'Active';
}

function shortenScope(scope: string): string {
  return scope.replace('https://www.googleapis.com/auth/', '');
}

export function AgentOauthGoogle() {
  const { t: _t } = useTranslation();
  useDocumentTitle('Google 授权');

  const tokens = useUserOauthTokens();
  const start = useStartGoogleAuthorize();
  const revoke = useRevokeGoogleToken();

  const grantedScopes = new Set((tokens.data ?? []).filter((t) => !t.revokedAt).map((t) => t.scope));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Google 账户授权"
        subtitle="授予 Chrono Synth 代表你访问 Calendar / Gmail 的权限；可随时撤销，撤销后任何 agent 调用立即失败"
      />

      <section className="rounded-xl border border-border bg-surface-elevated p-4 space-y-3">
        <h2 className="text-base font-semibold">添加新授权</h2>
        <ul className="space-y-2">
          {GOOGLE_SCOPES.map((s) => {
            const granted = grantedScopes.has(s.value);
            return (
              <li key={s.value} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm">{s.label}</p>
                  <p className="font-mono text-xs text-text-secondary truncate">{s.value}</p>
                </div>
                <button
                  type="button"
                  className="rounded border border-border bg-surface px-3 py-1 text-sm hover:bg-surface/80 disabled:opacity-50"
                  disabled={granted || start.isPending}
                  onClick={async () => {
                    const result = await start.mutateAsync({
                      scope: s.value,
                      redirectAfter: '/agent/oauth/google',
                    });
                    if (typeof window !== 'undefined') {
                      window.location.assign(result.authorizeUrl);
                    }
                  }}
                >
                  {granted ? '已授权' : start.isPending ? '准备中…' : '授权'}
                </button>
              </li>
            );
          })}
        </ul>
        {start.error && (
          <p className="text-xs text-warning">
            授权启动失败：{(start.error as Error).message}
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">已授权 scope</h2>
        {tokens.isLoading ? (
          <Skeleton variant="card" />
        ) : tokens.error ? (
          <EmptyState variant="error" message={`加载失败：${(tokens.error as Error).message}`} />
        ) : (tokens.data ?? []).length === 0 ? (
          <EmptyState message="还没有授权任何 Google scope。" />
        ) : (
          <div className="rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left border-b border-border bg-surface">
                <tr>
                  <th className="p-3">Scope</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Granted</th>
                  <th className="p-3">Expires</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {tokens.data!.map((tok) => (
                  <tr key={tok.id} className="border-b border-border/50">
                    <td className="p-3 font-mono text-xs">{shortenScope(tok.scope)}</td>
                    <td className="p-3">
                      <StatusBadge status={tokenStatus(tok)} label={tokenStatusLabel(tok)} />
                    </td>
                    <td className="p-3 text-xs">{formatTs(tok.grantedAt)}</td>
                    <td className="p-3 text-xs">{formatTs(tok.accessExpiresAt)}</td>
                    <td className="p-3">
                      {tok.revokedAt === null && (
                        <button
                          type="button"
                          className="text-xs text-warning hover:underline"
                          disabled={revoke.isPending}
                          onClick={() => {
                            if (!window.confirm(`撤销 ${shortenScope(tok.scope)} 授权？所有正在调用此 scope 的 agent 将立即失败。`)) return;
                            revoke.mutate({ id: tok.id });
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
      </section>
    </div>
  );
}
