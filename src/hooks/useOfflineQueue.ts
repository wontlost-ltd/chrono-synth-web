import { useCallback, useSyncExternalStore } from 'react';

export interface QueuedAction {
  id: string;
  label: string;
  timestamp: number;
}

const STORAGE_KEY = 'chronosynth_offline_queue';
const MAX_QUEUE_SIZE = 100;
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

function loadQueue(): QueuedAction[] {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QueuedAction[]) : [];
  } catch {
    return [];
  }
}

function saveQueue(q: QueuedAction[]): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(q));
  } catch { /* quota exceeded — silently ignore */ }
}

let queue: QueuedAction[] = loadQueue();
const listeners = new Set<() => void>();

function notify() {
  for (const cb of listeners) cb();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

function getSnapshot(): QueuedAction[] {
  return queue;
}

function getServerSnapshot(): QueuedAction[] {
  return [];
}

export function enqueueOfflineAction(label: string): string {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  queue = [...queue, { id, label, timestamp: Date.now() }].slice(-MAX_QUEUE_SIZE);
  saveQueue(queue);
  notify();
  return id;
}

export function dequeueOfflineAction(id: string): void {
  queue = queue.filter(a => a.id !== id);
  saveQueue(queue);
  notify();
}

export function clearOfflineQueue(): void {
  queue = [];
  saveQueue(queue);
  notify();
}

export function useOfflineQueue() {
  const actions = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const enqueue = useCallback((label: string) => enqueueOfflineAction(label), []);
  const dequeue = useCallback((id: string) => dequeueOfflineAction(id), []);
  const clear = useCallback(() => clearOfflineQueue(), []);

  return { actions, enqueue, dequeue, clear, count: actions.length };
}
