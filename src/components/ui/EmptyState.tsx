import type { ReactNode } from 'react';

interface EmptyStateProps {
  message: string;
  action?: ReactNode;
  variant?: 'empty' | 'error';
}

export function EmptyState({ message, action, variant = 'empty' }: EmptyStateProps) {
  const isError = variant === 'error';
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center"
      role={isError ? 'alert' : 'status'}
    >
      <p className={isError ? 'text-warning' : 'text-text-secondary'}>{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
