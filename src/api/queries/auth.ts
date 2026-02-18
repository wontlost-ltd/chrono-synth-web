import { useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '../../config';
import { setSession, clearSession } from '../../store/session';

interface AuthResponse {
  userId: string;
  email: string;
  tenantId: string;
  role?: string;
  accessToken: string;
  expiresIn: number;
}

/** accessToken 存内存，refreshToken 由后端通过 HttpOnly cookie 管理 */
function handleAuthSuccess(data: AuthResponse): void {
  setSession({
    accessToken: data.accessToken,
    tenantId: data.tenantId,
    mode: 'subscriber',
    user: { email: data.email, role: data.role ?? 'member', userId: data.userId },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async (body: { email: string; password: string }): Promise<AuthResponse> => {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        let msg: string | undefined;
        try { msg = (JSON.parse(text) as { message?: string }).message; } catch { /* ignore */ }
        throw new Error(msg ?? `HTTP ${res.status}`);
      }
      const json = await res.json() as { data: AuthResponse };
      return json.data;
    },
    onSuccess: handleAuthSuccess,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (body: { email: string; password: string }): Promise<AuthResponse> => {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        let msg: string | undefined;
        try { msg = (JSON.parse(text) as { message?: string }).message; } catch { /* ignore */ }
        throw new Error(msg ?? `HTTP ${res.status}`);
      }
      const json = await res.json() as { data: AuthResponse };
      return json.data;
    },
    onSuccess: handleAuthSuccess,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async (): Promise<void> => {
      const session = await import('../../store/session').then(m => m.getSession());
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(session.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        },
      }).catch(() => { /* 忽略网络错误 */ });
      clearSession();
    },
  });
}
