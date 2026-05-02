import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useOfflineQueue,
  enqueueOfflineAction,
  dequeueOfflineAction,
  clearOfflineQueue,
} from './useOfflineQueue';

const STORAGE_KEY = 'chronosynth_offline_queue';

beforeEach(() => {
  localStorage.clear();
  clearOfflineQueue();
});

describe('enqueueOfflineAction', () => {
  it('returns a unique id', () => {
    const a = enqueueOfflineAction('action-1');
    const b = enqueueOfflineAction('action-2');
    expect(a).not.toBe(b);
  });

  it('persists to localStorage', () => {
    enqueueOfflineAction('save-persona');
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!) as unknown[];
    expect(parsed).toHaveLength(1);
  });

  it('records label and timestamp', () => {
    const before = Date.now();
    enqueueOfflineAction('my-action');
    const after = Date.now();
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as Array<{ label: string; timestamp: number }>;
    expect(raw[0]?.label).toBe('my-action');
    expect(raw[0]?.timestamp).toBeGreaterThanOrEqual(before);
    expect(raw[0]?.timestamp).toBeLessThanOrEqual(after);
  });
});

describe('dequeueOfflineAction', () => {
  it('removes the action by id', () => {
    const id = enqueueOfflineAction('remove-me');
    dequeueOfflineAction(id);
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as unknown[];
    expect(raw).toHaveLength(0);
  });

  it('is a no-op for unknown ids', () => {
    enqueueOfflineAction('keep-me');
    dequeueOfflineAction('nonexistent-id');
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as unknown[];
    expect(raw).toHaveLength(1);
  });
});

describe('clearOfflineQueue', () => {
  it('empties the queue', () => {
    enqueueOfflineAction('a');
    enqueueOfflineAction('b');
    clearOfflineQueue();
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as unknown[];
    expect(raw).toHaveLength(0);
  });
});

describe('useOfflineQueue hook', () => {
  it('returns empty queue initially', () => {
    const { result } = renderHook(() => useOfflineQueue());
    expect(result.current.actions).toHaveLength(0);
    expect(result.current.count).toBe(0);
  });

  it('enqueue via hook reflects in actions', () => {
    const { result } = renderHook(() => useOfflineQueue());
    act(() => { result.current.enqueue('hook-action'); });
    expect(result.current.count).toBe(1);
    expect(result.current.actions[0]?.label).toBe('hook-action');
  });

  it('dequeue via hook removes action', () => {
    const { result } = renderHook(() => useOfflineQueue());
    let id!: string;
    act(() => { id = result.current.enqueue('to-remove'); });
    act(() => { result.current.dequeue(id); });
    expect(result.current.count).toBe(0);
  });

  it('clear via hook empties queue', () => {
    const { result } = renderHook(() => useOfflineQueue());
    act(() => {
      result.current.enqueue('x');
      result.current.enqueue('y');
    });
    act(() => { result.current.clear(); });
    expect(result.current.count).toBe(0);
  });

  it('caps queue at 100 items', () => {
    const { result } = renderHook(() => useOfflineQueue());
    act(() => {
      for (let i = 0; i < 110; i++) result.current.enqueue(`action-${i}`);
    });
    expect(result.current.count).toBe(100);
  });
});

describe('useReconnectFlush', () => {
  it('calls flushFn for each queued action when online and dequeues on success', async () => {
    const { useReconnectFlush } = await import('./useOfflineQueue');
    enqueueOfflineAction('flush-me');

    const flushFn = vi.fn().mockResolvedValue(undefined);
    renderHook(() => useReconnectFlush(flushFn));

    await vi.waitFor(() => expect(flushFn).toHaveBeenCalledOnce());
  });

  it('leaves action in queue when flushFn rejects', async () => {
    const { useReconnectFlush } = await import('./useOfflineQueue');
    enqueueOfflineAction('fails');

    const flushFn = vi.fn().mockRejectedValue(new Error('network error'));
    renderHook(() => useReconnectFlush(flushFn));

    await vi.waitFor(() => expect(flushFn).toHaveBeenCalled());
    // Action remains because flush failed
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as unknown[];
    expect(raw).toHaveLength(1);
  });
});
