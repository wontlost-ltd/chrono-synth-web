import type { RuntimeSyncStateV2 } from '@chrono/contracts';

interface SyncStatusIndicatorProps {
  state: RuntimeSyncStateV2;
  pendingCount?: number;
  className?: string;
}

const STATE_COLORS: Record<RuntimeSyncStateV2, string> = {
  initial_sync:      '#0369A1',
  online_synced:     '#2f6b3b',
  online_dirty:      '#0369A1',
  syncing:           '#0369A1',
  offline_queueing:  '#6B7280',
  offline_readonly:  '#6B7280',
  conflict_inbox:    '#C2410C',
  degraded_remote:   '#9f2621',
  reauth_required:   '#C2410C',
  recovery_required: '#9f2621',
};

const STATE_LABELS: Record<RuntimeSyncStateV2, string> = {
  initial_sync:      '初始同步中',
  online_synced:     '已同步',
  online_dirty:      '有待上传',
  syncing:           '同步中',
  offline_queueing:  '离线（排队中）',
  offline_readonly:  '离线（只读）',
  conflict_inbox:    '有冲突',
  degraded_remote:   '远端异常',
  reauth_required:   '需重新认证',
  recovery_required: '需手动恢复',
};

export function SyncStatusIndicator({
  state,
  pendingCount = 0,
  className,
}: SyncStatusIndicatorProps) {
  const label = STATE_LABELS[state];
  const ariaLabel = pendingCount > 0 ? `${label} (${pendingCount})` : label;

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
    >
      <span
        aria-hidden="true"
        style={{
          backgroundColor: STATE_COLORS[state],
          borderRadius: '9999px',
          display: 'inline-block',
          height: 8,
          width: 8,
        }}
      />
      <span>
        {label}
        {pendingCount > 0 ? ` (${pendingCount})` : null}
      </span>
    </span>
  );
}
