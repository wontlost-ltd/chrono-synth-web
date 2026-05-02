import { useCallback, useEffect, useState } from 'react';
import type { RuntimeSyncStateV1 } from '@chrono/contracts';
import { useWebSocket } from '@/hooks/useWebSocket';

export interface SyncEngineState {
  state: RuntimeSyncStateV1;
  pendingPushCount: number;
  pendingPullCount: number;
  conflictCount: number;
  lastSyncedAt: number | null;
  lastErrorMessage: string | null;
}

const INITIAL_SYNC_ENGINE_STATE: SyncEngineState = {
  state: 'idle',
  pendingPushCount: 0,
  pendingPullCount: 0,
  conflictCount: 0,
  lastSyncedAt: null,
  lastErrorMessage: null,
};

export function useSyncEngine(): SyncEngineState & { forceSync(): void } {
  const [state, setState] = useState<SyncEngineState>(INITIAL_SYNC_ENGINE_STATE);
  const { subscribe, send } = useWebSocket({ autoConnect: false });

  useEffect(() => {
    return subscribe('sync.state_changed', (payload: unknown) => {
      const patch = payload as Partial<SyncEngineState>;
      setState((prev) => ({ ...prev, ...patch }));
    });
  }, [subscribe]);

  const forceSync = useCallback(() => {
    send({ action: 'sync.force' });
  }, [send]);

  return { ...state, forceSync };
}
