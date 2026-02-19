import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLogin } from '../api/queries/auth';
import { SSOButton } from '../components/ui/SSOButton';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function Login() {
  const { t } = useTranslation();
  useDocumentTitle(t('login.login'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    login.mutate({ email, password }, {
      onSuccess: () => navigate(from, { replace: true }),
    });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface-elevated p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-primary">ChronoSynth</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-text-secondary">
              {t('login.emailLabel')}
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-text-secondary">
              {t('login.passwordLabel')}
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {login.error && (
            <p className="text-sm text-warning" role="alert">{login.error.message}</p>
          )}
          <button
            type="submit"
            disabled={login.isPending}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-50"
          >
            {login.isPending ? t('login.loggingIn') : t('login.login')}
          </button>
        </form>
        <div className="mt-4 flex items-center gap-3">
          <hr className="flex-1 border-border" />
          <span className="text-xs text-text-secondary">{t('sso.orDivider')}</span>
          <hr className="flex-1 border-border" />
        </div>
        <div className="mt-4">
          <SSOButton />
        </div>
        <p className="mt-4 text-center text-sm text-text-secondary">
          {t('login.noAccount')}
          <Link to="/register" className="ml-1 font-medium text-primary hover:underline">
            {t('login.register')}
          </Link>
        </p>
      </div>
    </div>
  );
}
