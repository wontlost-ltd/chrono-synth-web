import type { ReactNode } from 'react';
import { useSession, type UserMode } from '../../store/session';

interface FeatureGateProps {
  required: UserMode;
  fallback?: ReactNode;
  children: ReactNode;
}

export function FeatureGate({ required, fallback, children }: FeatureGateProps) {
  const session = useSession();

  if (required === 'subscriber' && session.mode !== 'subscriber') {
    return fallback ? <>{fallback}</> : (
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 text-center" role="status">
        <p className="font-medium text-accent">此功能需要订阅</p>
        <p className="mt-1 text-sm text-text-secondary">升级到订阅版本以解锁全部功能</p>
      </div>
    );
  }

  return <>{children}</>;
}
