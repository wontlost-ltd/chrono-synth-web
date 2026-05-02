import type { CopyMessageId, RuntimeSyncStateV1 } from '@chrono/contracts';
import { color, zhCNCatalog } from '@chrono/contracts';

interface SyncStatusIndicatorProps {
  state: RuntimeSyncStateV1;
  pendingCount?: number;
  className?: string;
}

const chronoDesignTokens = { color } as const;

export function SyncStatusIndicator({
  state,
  pendingCount = 0,
  className,
}: SyncStatusIndicatorProps) {
  const messageId = `sync.${state}` as CopyMessageId;
  const label = zhCNCatalog[messageId];
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
          backgroundColor: chronoDesignTokens.color.status[state],
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
