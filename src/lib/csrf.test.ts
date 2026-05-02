import { describe, it, expect, beforeEach } from 'vitest';
import { getCsrfToken, resetCsrfToken } from './csrf';

beforeEach(() => {
  resetCsrfToken();
  document.head.innerHTML = '';
  document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
});

describe('getCsrfToken', () => {
  it('returns null when no token source exists', () => {
    expect(getCsrfToken()).toBeNull();
  });

  it('reads token from meta tag', () => {
    const meta = document.createElement('meta');
    meta.name = 'csrf-token';
    meta.content = 'meta-token-abc';
    document.head.appendChild(meta);

    expect(getCsrfToken()).toBe('meta-token-abc');
  });

  it('reads token from XSRF-TOKEN cookie when meta absent', () => {
    document.cookie = 'XSRF-TOKEN=cookie-token-xyz';
    expect(getCsrfToken()).toBe('cookie-token-xyz');
  });

  it('prefers meta tag over cookie', () => {
    const meta = document.createElement('meta');
    meta.name = 'csrf-token';
    meta.content = 'meta-wins';
    document.head.appendChild(meta);
    document.cookie = 'XSRF-TOKEN=cookie-loses';

    expect(getCsrfToken()).toBe('meta-wins');
  });

  it('caches result — subsequent calls return same value', () => {
    const meta = document.createElement('meta');
    meta.name = 'csrf-token';
    meta.content = 'cached-token';
    document.head.appendChild(meta);

    const first = getCsrfToken();
    // Remove the meta tag — cached value should still be returned
    document.head.innerHTML = '';
    const second = getCsrfToken();

    expect(first).toBe('cached-token');
    expect(second).toBe('cached-token');
  });

  it('reads fresh value after resetCsrfToken', () => {
    const meta = document.createElement('meta');
    meta.name = 'csrf-token';
    meta.content = 'old-token';
    document.head.appendChild(meta);
    getCsrfToken(); // populate cache

    // Rotate token
    meta.content = 'new-token';
    resetCsrfToken();

    expect(getCsrfToken()).toBe('new-token');
  });

  it('decodes percent-encoded cookie value', () => {
    document.cookie = 'XSRF-TOKEN=hello%20world';
    expect(getCsrfToken()).toBe('hello world');
  });
});
