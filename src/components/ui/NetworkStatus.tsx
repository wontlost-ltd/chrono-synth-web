import { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';

const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';

function subscribe(cb: () => void) {
  if (!isBrowser) return () => {};
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
}

function getSnapshot() {
  return isBrowser ? navigator.onLine : true;
}

function getServerSnapshot() {
  return true;
}

export function NetworkStatus() {
  const { t } = useTranslation();
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (isOnline) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-warning px-4 py-2 text-sm text-white shadow-lg"
    >
      {t('common.offline')}
    </div>
  );
}
