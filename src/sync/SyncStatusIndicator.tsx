/**
 * SyncStatusIndicator — 同步状态指示器
 * 显示当前同步状态、离线队列计数，并提供手动触发按钮
 */

import type { SyncStatusSnapshotV1 } from '@chrono/contracts';
import type { UseSyncEngineResult } from './use-sync-engine';

const STATE_LABELS: Record<SyncStatusSnapshotV1['state'], string> = {
  unconfigured: '未配置',
  disabled: '已禁用',
  idle: '已同步',
  pulling: '拉取中…',
  merging: '合并中…',
  pushing: '推送中…',
  paused: '已暂停',
  offline: '离线',
  conflicted: '有冲突',
  error: '同步错误',
};

const STATE_COLOR: Record<SyncStatusSnapshotV1['state'], string> = {
  unconfigured: 'text-gray-400',
  disabled: 'text-gray-400',
  idle: 'text-green-600',
  pulling: 'text-blue-500',
  merging: 'text-blue-500',
  pushing: 'text-blue-500',
  paused: 'text-yellow-500',
  offline: 'text-gray-500',
  conflicted: 'text-red-500',
  error: 'text-red-600',
};

interface Props {
  engine: UseSyncEngineResult;
}

export function SyncStatusIndicator({ engine }: Props) {
  const { snapshot, pause, resume, triggerSync } = engine;
  const { state, pendingPushCount, conflictCount, lastErrorCode, capabilities } = snapshot;

  return (
    <div className="flex items-center gap-2 text-sm" aria-live="polite" aria-label="同步状态">
      <span className={STATE_COLOR[state]} title={lastErrorCode ?? undefined}>
        {STATE_LABELS[state]}
      </span>

      {pendingPushCount > 0 && (
        <span className="text-gray-500">({pendingPushCount} 待推送)</span>
      )}

      {conflictCount > 0 && (
        <span className="text-red-500 font-medium">{conflictCount} 冲突</span>
      )}

      {capabilities.canStartSync && (
        <button
          type="button"
          onClick={triggerSync}
          className="text-blue-500 hover:text-blue-700 underline"
          aria-label="立即同步"
        >
          同步
        </button>
      )}

      {capabilities.canPause && (
        <button
          type="button"
          onClick={pause}
          className="text-gray-500 hover:text-gray-700 underline"
          aria-label="暂停同步"
        >
          暂停
        </button>
      )}

      {capabilities.canResume && (
        <button
          type="button"
          onClick={resume}
          className="text-gray-500 hover:text-gray-700 underline"
          aria-label="恢复同步"
        >
          恢复
        </button>
      )}
    </div>
  );
}
