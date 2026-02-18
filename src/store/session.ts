import { useSyncExternalStore } from 'react';

export type UserMode = 'demo' | 'subscriber';

interface Session {
  apiKey: string;
  tenantId: string;
  mode: UserMode;
}

const STORAGE_KEY = 'chrono-session';

function load(): Session {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Session;
  } catch { /* ignore */ }
  return { apiKey: '', tenantId: 'default', mode: 'demo' };
}

let current = load();
const listeners = new Set<() => void>();

function emitChange(): void {
  for (const fn of listeners) fn();
}

export function getSession(): Readonly<Session> {
  return current;
}

export function setSession(patch: Partial<Session>): void {
  current = { ...current, ...patch };
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current)); } catch { /* storage unavailable */ }
  emitChange();
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function useSession(): Readonly<Session> {
  return useSyncExternalStore(subscribe, getSession, getSession);
}
