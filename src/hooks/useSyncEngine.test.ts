import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSyncEngine } from './useSyncEngine';

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

  it('starts idle', () => {
    const { result } = renderHook(() => useSyncEngine());

    expect(result.current.state).toBe('idle');
  });

  it('initializes all state fields to zero/null defaults', () => {
    const { result } = renderHook(() => useSyncEngine());

    expect(result.current.pendingPushCount).toBe(0);
    expect(result.current.pendingPullCount).toBe(0);
    expect(result.current.conflictCount).toBe(0);
    expect(result.current.lastSyncedAt).toBeNull();
    expect(result.current.lastErrorMessage).toBeNull();
  });

  it('forceSync sends a force sync action', () => {
    const { result } = renderHook(() => useSyncEngine());

    act(() => {
      result.current.forceSync();
    });

    expect(send).toHaveBeenCalledWith({ action: 'sync.force' });
  });

  it('merges sync.state_changed WebSocket payload into state', () => {
    const { result } = renderHook(() => useSyncEngine());

    act(() => {
      capturedStateChanged?.({ state: 'pushing', pendingPushCount: 3 });
    });

    expect(result.current.state).toBe('pushing');
    expect(result.current.pendingPushCount).toBe(3);
  });
});
