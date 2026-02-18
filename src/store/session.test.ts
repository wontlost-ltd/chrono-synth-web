import { describe, it, expect, beforeEach } from 'vitest';
import { getSession, setSession } from './session';

beforeEach(() => {
  sessionStorage.clear();
  setSession({ apiKey: '', tenantId: 'default', mode: 'demo' });
});

describe('getSession', () => {
  it('returns default session when storage is empty', () => {
    const session = getSession();
    expect(session.apiKey).toBe('');
    expect(session.tenantId).toBe('default');
    expect(session.mode).toBe('demo');
  });
});

describe('setSession', () => {
  it('updates session with partial patch', () => {
    setSession({ apiKey: 'test-key' });
    const session = getSession();
    expect(session.apiKey).toBe('test-key');
    expect(session.tenantId).toBe('default');
  });

  it('persists to sessionStorage', () => {
    setSession({ tenantId: 'tenant-1', mode: 'subscriber' });
    const raw = sessionStorage.getItem('chrono-session');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.tenantId).toBe('tenant-1');
    expect(parsed.mode).toBe('subscriber');
  });

  it('merges multiple patches', () => {
    setSession({ apiKey: 'key-1' });
    setSession({ tenantId: 'tenant-2' });
    const session = getSession();
    expect(session.apiKey).toBe('key-1');
    expect(session.tenantId).toBe('tenant-2');
  });

  it('updates mode correctly', () => {
    setSession({ mode: 'subscriber' });
    expect(getSession().mode).toBe('subscriber');
    setSession({ mode: 'demo' });
    expect(getSession().mode).toBe('demo');
  });
});
