import { API_BASE_URL } from '../config';
import { getSession } from '../store/session';

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function sanitizeErrorMessage(status: number, raw: string): string {
  if (!raw || raw.length > 200) return `API 请求失败 (${status})`;
  if (/[<>]|stack|trace|sql|select|insert|update|delete/i.test(raw)) return `API 请求失败 (${status})`;
  return `API ${status}: ${raw}`;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const session = getSession();
  const headers: Record<string, string> = {};
  if (session.apiKey) headers['X-API-Key'] = session.apiKey;
  if (session.tenantId) headers['X-Tenant-Id'] = session.tenantId;

  const method = init?.method?.toUpperCase() ?? 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    signal: init?.signal,
    headers: { ...headers, ...init?.headers },
  });

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
    throw new ApiError(res.status, `无效的 JSON 响应`);
  }

  return (json.data ?? json) as T;
}
