import { useCallback, useEffect, useState } from 'react';
import type {
  ConflictInboxItemV1,
  ConflictResolveRequestV1,
  ConflictResolveResultV1,
} from '@chrono/contracts';
import { apiFetch } from '@/api/client';
import { useSyncEngine } from '@/sync/use-sync-engine';

export type ConflictAction = ConflictResolveRequestV1['action'];

export function useConflictInbox(): {
  conflicts: ConflictInboxItemV1[];
  loading: boolean;
  resolving: string | null;
  resolve(conflictId: string, conflictVersion: string, action: ConflictAction): Promise<void>;
  refresh(): void;
} {
  const [conflicts, setConflicts] = useState<ConflictInboxItemV1[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const syncEngine = useSyncEngine({ enabled: true });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const next = await apiFetch<ConflictInboxItemV1[]>('/api/v1/conflicts');
      setConflicts(next);
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
    } finally {
      setResolving(null);
    }
  }, [syncEngine]);

  return { conflicts, loading, resolving, resolve, refresh };
}
