import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RuntimeSyncStateV1Values } from '@chrono/contracts';
import { SyncStatusIndicator } from './SyncStatusIndicator';

describe('SyncStatusIndicator', () => {
  it('renders idle status', () => {
    render(<SyncStatusIndicator state="idle" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders offline pending count', () => {
    render(<SyncStatusIndicator state="offline" pendingCount={3} />);

    expect(screen.getByRole('status')).toHaveTextContent('3');
  });

  it('has a non-empty aria-label for error state', () => {
    render(<SyncStatusIndicator state="error" />);

    expect(screen.getByRole('status')).toHaveAccessibleName(/.+/);
  });

  it.each(RuntimeSyncStateV1Values.map(s => ({ state: s })))('renders $state', ({ state }) => {
    render(<SyncStatusIndicator state={state} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('does not show pending count when pendingCount is 0', () => {
    render(<SyncStatusIndicator state="offline" pendingCount={0} />);

    expect(screen.getByRole('status')).not.toHaveTextContent('(0)');
  });

  it('applies custom className prop', () => {
    render(<SyncStatusIndicator state="idle" className="test-cls" />);

    expect(screen.getByRole('status')).toHaveClass('test-cls');
  });
});
