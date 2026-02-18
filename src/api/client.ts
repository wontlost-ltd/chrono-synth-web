import { API_BASE_URL } from '../config';
import { getSession, setSession, clearSession } from '../store/session';
import { addApiBreadcrumb } from '../lib/sentry';

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function sanitizeErrorMessage(status: number, raw: string): string {
  if (!raw || raw.length > 200) return `API request failed (${status})`;
  if (/[<>]|stack|trace|sql|select|insert|update|delete/i.test(raw)) return `API request failed (${status})`;
  return `API ${status}: ${raw}`;
}

let refreshPromise: Promise<boolean> | null = null;

/** 尝试通过 HttpOnly cookie 刷新 accessToken */
async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: '{}',
      });
      if (!res.ok) {
        clearSession();
        return false;
      }
      const json = await res.json() as { data: { accessToken: string } };
      setSession({ accessToken: json.data.accessToken });
      return true;
    } catch {
      clearSession();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/** 公开刷新接口，供 AuthGuard 启动时尝试恢复会话 */
export async function refreshAccessToken(): Promise<boolean> {
  return tryRefresh();
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await doFetch<T>(path, init);
  return res;
}

async function doFetch<T>(path: string, init?: RequestInit, isRetry = false): Promise<T> {
  const session = getSession();
  const headers: Record<string, string> = {};

  /* 优先使用 Bearer token，回退到 API Key */
  if (session.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  } else if (session.apiKey) {
    headers['X-API-Key'] = session.apiKey;
  }
  if (session.tenantId) headers['X-Tenant-Id'] = session.tenantId;

  const method = init?.method?.toUpperCase() ?? 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    signal: init?.signal,
    headers: { ...headers, ...init?.headers },
    credentials: 'include',
  });

  /* 401 + 非重试 → 尝试通过 cookie 刷新后重试一次 */
  if (res.status === 401 && !isRetry) {
    const refreshed = await tryRefresh();
    if (refreshed) return doFetch<T>(path, init, true);
  }

  addApiBreadcrumb(method, path, res.status);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new ApiError(res.status, sanitizeErrorMessage(res.status, text));
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return undefined as T;
  }

  const body = await res.text();
  if (!body.trim()) return undefined as T;

  let json: { data?: T };
  try {
    json = JSON.parse(body) as { data?: T };
  } catch {
    throw new ApiError(res.status, `Invalid JSON response`);
  }

  return (json.data ?? json) as T;
}
