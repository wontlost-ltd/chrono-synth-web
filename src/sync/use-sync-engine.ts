/**
 * useSyncEngine — 离线优先同步状态机
 *
 * 驱动 RuntimeSyncStateV1 状态机，协调：
 * - 网络状态变化 → offline / resumed 事件
 * - 定时 pull + flush outbox
 * - 暴露 SyncStatusSnapshotV1 给 UI 消费
 */

import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { SyncStatusSnapshotV1, RuntimeSyncEvent } from '@chrono/contracts';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { getSession } from '@/store/session';
import { pullIncremental, flushOutbox, countOutbox } from './sync-client';

// ── State machine ─────────────────────────────────────────────────────────────

type SyncState = SyncStatusSnapshotV1;

function capabilities(state: SyncStatusSnapshotV1['state'], syncEnabled: boolean): SyncStatusSnapshotV1['capabilities'] {
  return {
    canConfigure: true,
    canStartSync: syncEnabled && (state === 'idle' || state === 'error' || state === 'paused'),
    canPause: state === 'idle' || state === 'pulling' || state === 'merging' || state === 'pushing',
    canResume: state === 'paused',
    canResolveConflict: state === 'conflicted',
    canRetry: state === 'error',
    canDisable: syncEnabled,
  };
}

function initialState(syncEnabled: boolean, networkOnline: boolean): SyncState {
  const state = !syncEnabled ? 'disabled' : !networkOnline ? 'offline' : 'idle';
  return {
    schemaVersion: 1,
    state,
    syncEnabled,
    networkOnline,
    pendingPullCount: 0,
    pendingPushCount: 0,
    conflictCount: 0,
    lastSyncStartedAt: null,
    lastSyncCompletedAt: null,
    lastErrorCode: null,
    lastErrorMessage: null,
    activeRunId: null,
    capabilities: capabilities(state, syncEnabled),
  };
}

function applyEvent(prev: SyncState, event: RuntimeSyncEvent): SyncState {
  let next = { ...prev };

  switch (event.type) {
    case 'sync.configured':
      next.syncEnabled = event.enabled;
      next.state = !event.enabled ? 'disabled' : prev.networkOnline ? 'idle' : 'offline';
      break;
    case 'sync.disabled':
      next.syncEnabled = false;
      next.state = 'disabled';
      break;
    case 'sync.started':
      if (prev.state === 'idle' || prev.state === 'error' || prev.state === 'paused') {
        next.state = 'pulling';
        next.activeRunId = event.runId;
        next.lastSyncStartedAt = event.occurredAt;
        next.lastErrorCode = null;
        next.lastErrorMessage = null;
      }
      break;
    case 'sync.pull.completed':
      if (prev.state === 'pulling') {
        next.state = 'merging';
        next.pendingPullCount = event.pendingPullCount;
      }
      break;
    case 'sync.merge.completed':
      if (prev.state === 'merging') {
        next.state = 'pushing';
        next.pendingPushCount = event.pendingPushCount;
      }
      break;
    case 'sync.push.completed':
      if (prev.state === 'pushing') {
        next.state = 'idle';
        next.pendingPushCount = 0;
        next.activeRunId = null;
        next.lastSyncCompletedAt = event.occurredAt;
      }
      break;
    case 'sync.conflict.detected':
      next.state = 'conflicted';
      next.conflictCount = event.conflictCount;
      break;
    case 'sync.conflict.resolved':
      if (prev.state === 'conflicted') {
        next.state = 'idle';
        next.conflictCount = 0;
      }
      break;
    case 'sync.paused':
      if (prev.state !== 'disabled' && prev.state !== 'offline') next.state = 'paused';
      break;
    case 'sync.resumed':
      if (prev.state === 'paused') next.state = prev.networkOnline ? 'idle' : 'offline';
      break;
    case 'sync.network.offline':
      next.networkOnline = false;
      if (prev.state !== 'disabled' && prev.state !== 'paused') next.state = 'offline';
      break;
    case 'sync.network.online':
      next.networkOnline = true;
      if (prev.state === 'offline') next.state = 'idle';
      break;
    case 'sync.failed':
      next.state = 'error';
      next.activeRunId = null;
      next.lastErrorCode = event.errorCode;
      next.lastErrorMessage = event.errorMessage ?? null;
      break;
    case 'sync.reset':
      return initialState(next.syncEnabled, next.networkOnline);
  }

  next.capabilities = capabilities(next.state, next.syncEnabled);
  return next;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface UseSyncEngineOptions {
  enabled?: boolean;
  pollIntervalMs?: number;
}

export interface UseSyncEngineResult {
  snapshot: SyncStatusSnapshotV1;
  pause: () => void;
  resume: () => void;
  enable: () => void;
  disable: () => void;
  triggerSync: () => void;
}

export function useSyncEngine({
  enabled = false,
  pollIntervalMs = 30_000,
}: UseSyncEngineOptions = {}): UseSyncEngineResult {
  const networkOnline = useOnlineStatus();
  const [snapshot, dispatch] = useReducer(applyEvent, undefined, () =>
    initialState(enabled, networkOnline),
  );
  const syncingRef = useRef(false);
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  // Network state changes
  useEffect(() => {
    dispatch(
      networkOnline
        ? { type: 'sync.network.online', occurredAt: Date.now() }
        : { type: 'sync.network.offline', occurredAt: Date.now() },
    );
  }, [networkOnline]);

  // Sync enabled/disabled changes
  useEffect(() => {
    dispatch({ type: 'sync.configured', enabled, occurredAt: Date.now() });
  }, [enabled]);

  const runSync = useCallback(async () => {
    const current = snapshotRef.current;
    if (syncingRef.current) return;
    if (!current.syncEnabled || !current.networkOnline) return;
    if (current.state !== 'idle' && current.state !== 'error') return;

    syncingRef.current = true;
    const runId = crypto.randomUUID();
    dispatch({ type: 'sync.started', runId, occurredAt: Date.now() });

    try {
      const { tenantId } = getSession();

      // Pull
      const pulledCount = await pullIncremental(tenantId);
      dispatch({ type: 'sync.pull.completed', pendingPullCount: pulledCount, occurredAt: Date.now() });

      // Merge (count outbox)
      const pushCount = await countOutbox(tenantId);
      dispatch({ type: 'sync.merge.completed', pendingPushCount: pushCount, occurredAt: Date.now() });

      // Push
      await flushOutbox(tenantId);
      dispatch({ type: 'sync.push.completed', occurredAt: Date.now() });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      dispatch({
        type: 'sync.failed',
        errorCode: 'SYNC_ERROR',
        errorMessage: message,
        occurredAt: Date.now(),
      });
    } finally {
      syncingRef.current = false;
    }
  }, []);

  // Poll loop
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => { void runSync(); }, pollIntervalMs);
    // Trigger immediately on mount
    void runSync();
    return () => clearInterval(id);
  }, [enabled, pollIntervalMs, runSync]);

  const pause = useCallback(() => dispatch({ type: 'sync.paused', occurredAt: Date.now() }), []);
  const resume = useCallback(() => dispatch({ type: 'sync.resumed', occurredAt: Date.now() }), []);
  const enable = useCallback(() => dispatch({ type: 'sync.configured', enabled: true, occurredAt: Date.now() }), []);
  const disable = useCallback(() => dispatch({ type: 'sync.disabled', occurredAt: Date.now() }), []);
  const triggerSync = useCallback(() => { void runSync(); }, [runSync]);

  return { snapshot, pause, resume, enable, disable, triggerSync };
}
