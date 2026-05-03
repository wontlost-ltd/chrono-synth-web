import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSyncEngine, isSyncing, isOffline, hasConflicts, needsAttention } from './useSyncEngine';

const send = vi.fn();
const subscribe = vi.fn((_event: string, _cb: (payload: unknown) => void) => vi.fn());
let capturedStateChanged: ((payload: unknown) => void) | undefined;

vi.mock('@/hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    subscribe,
    send,
    status: 'connected',
    lastEvent: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    wsError: null,
  }),
}));

describe('useSyncEngine', () => {
  beforeEach(() => {
    send.mockClear();
    subscribe.mockReset();
    capturedStateChanged = undefined;
    subscribe.mockImplementation((event, cb) => {
      if (event === 'sync.state_changed') capturedStateChanged = cb;
      return vi.fn();
    });
  });

  it('starts in initial_sync state', () => {
    const { result } = renderHook(() => useSyncEngine());
    expect(result.current.state).toBe('initial_sync');
  });

  it('initializes all V2 snapshot fields to defaults', () => {
    const { result } = renderHook(() => useSyncEngine());
    expect(result.current.schemaVersion).toBe(2);
    expect(result.current.pendingPushCount).toBe(0);
    expect(result.current.pendingPullCount).toBe(0);
    expect(result.current.conflictCount).toBe(0);
    expect(result.current.lastSyncedLedgerVersion).toBeNull();
    expect(result.current.lastErrorCode).toBeNull();
    expect(result.current.activeRunId).toBeNull();
    expect(result.current.networkOnline).toBe(true);
    expect(result.current.authValid).toBe(true);
  });

  it('forceSync sends a force sync action', () => {
    const { result } = renderHook(() => useSyncEngine());
    act(() => { result.current.forceSync(); });
    expect(send).toHaveBeenCalledWith({ action: 'sync.force' });
  });

  it('merges sync.state_changed WebSocket payload into snapshot', () => {
    const { result } = renderHook(() => useSyncEngine());
    act(() => {
      capturedStateChanged?.({ state: 'syncing', pendingPushCount: 3, activeRunId: 'run-001' });
    });
    expect(result.current.state).toBe('syncing');
    expect(result.current.pendingPushCount).toBe(3);
    expect(result.current.activeRunId).toBe('run-001');
  });

  it('transitions to online_dirty when local changes arrive', () => {
    const { result } = renderHook(() => useSyncEngine());
    act(() => {
      capturedStateChanged?.({ state: 'online_dirty', pendingPushCount: 2 });
    });
    expect(result.current.state).toBe('online_dirty');
  });
});

describe('state predicates', () => {
  it('isSyncing', () => {
    expect(isSyncing('syncing')).toBe(true);
    expect(isSyncing('online_dirty')).toBe(false);
  });

  it('isOffline', () => {
    expect(isOffline('offline_queueing')).toBe(true);
    expect(isOffline('offline_readonly')).toBe(true);
    expect(isOffline('online_synced')).toBe(false);
  });

  it('hasConflicts', () => {
    expect(hasConflicts('conflict_inbox')).toBe(true);
    expect(hasConflicts('syncing')).toBe(false);
  });

  it('needsAttention', () => {
    expect(needsAttention('reauth_required')).toBe(true);
    expect(needsAttention('degraded_remote')).toBe(true);
    expect(needsAttention('recovery_required')).toBe(true);
    expect(needsAttention('online_synced')).toBe(false);
  });
});
