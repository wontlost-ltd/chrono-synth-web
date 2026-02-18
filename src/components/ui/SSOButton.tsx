import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../../config';

/**
 * SSO 登录按钮
 * 生成 CSRF state 参数存入 sessionStorage，重定向到后端 SSO 授权端点
 */
export function SSOButton() {
  const { t } = useTranslation();

  function handleClick() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const state = btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    try { sessionStorage.setItem('sso_state', state); } catch { /* ignore */ }

    const redirectUri = encodeURIComponent(`${window.location.origin}/sso/callback`);
    const stateParam = encodeURIComponent(state);
    window.location.href = `${API_BASE_URL}/api/v1/auth/sso/authorize?redirect_uri=${redirectUri}&state=${stateParam}`;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-elevated"
    >
      {t('sso.signInWithSSO')}
    </button>
  );
}
