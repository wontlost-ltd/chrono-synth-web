import { useCallback, useEffect, useState } from 'react';
import type {
  ConflictInboxItemV1,
  ConflictResolveRequestV1,
  ConflictResolveResultV1,
} from '@chrono/contracts';
import { apiFetch, ApiError } from '@/api/client';
import { useSyncEngine } from '@/sync/use-sync-engine';

export type ConflictAction = ConflictResolveRequestV1['action'];

/**
 * 错误描述 — 区分加载失败与解决失败，使页面能各自渲染合适的恢复入口。
 * `code` 来自后端 ApiError，UI 据此选 i18n 文案（不依赖易漂移的 message）。
 */
export interface ConflictError {
  scope: 'load' | 'resolve';
  status: number;
  code: string | null;
  messageId: string | null;
  message: string;
}

function toConflictError(scope: ConflictError['scope'], err: unknown): ConflictError {
  if (err instanceof ApiError) {
    return { scope, status: err.status, code: err.code, messageId: err.messageId, message: err.message };
  }
  return {
    scope,
    status: 0,
    code: null,
    messageId: null,
    message: err instanceof Error ? err.message : String(err),
  };
}

export function useConflictInbox(): {
  conflicts: ConflictInboxItemV1[];
  loading: boolean;
  resolving: string | null;
  error: ConflictError | null;
  resolve(conflictId: string, conflictVersion: string, action: ConflictAction): Promise<void>;
  refresh(): void;
} {
  const [conflicts, setConflicts] = useState<ConflictInboxItemV1[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const [error, setError] = useState<ConflictError | null>(null);
  const syncEngine = useSyncEngine({ enabled: true });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await apiFetch<ConflictInboxItemV1[]>('/api/v1/conflicts');
      setConflicts(next);
    } catch (err) {
      setError(toConflictError('load', err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = useCallback(() => {
    void load();
  }, [load]);

  const resolve = useCallback(async (
    conflictId: string,
    conflictVersion: string,
    action: ConflictAction,
  ) => {
    setResolving(conflictId);
    setError(null);
    try {
      await apiFetch<ConflictResolveResultV1>(`/api/v1/conflicts/${encodeURIComponent(conflictId)}/resolve`, {
        method: 'POST',
        body: JSON.stringify({
          conflictId,
          ifMatch: conflictVersion,
          action,
        } satisfies ConflictResolveRequestV1),
      });
      setConflicts((current) => current.filter((item) => item.conflictId !== conflictId));
      syncEngine.triggerSync();
    } catch (err) {
      const next = toConflictError('resolve', err);
      setError(next);
      /* 412/409 通常表示对端被其他客户端先一步解决 — 自动 refresh 刷新本地视图 */
      if (next.status === 412 || next.status === 409) {
        void load();
      }
    } finally {
      setResolving(null);
    }
  }, [syncEngine, load]);

  return { conflicts, loading, resolving, error, resolve, refresh };
}
