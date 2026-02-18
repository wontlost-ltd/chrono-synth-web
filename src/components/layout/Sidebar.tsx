import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useLogout } from '../../api/queries/auth';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

const NAV_ITEMS = [
  { to: '/dashboard', labelKey: 'sidebar.dashboard', icon: '📊' },
  { to: '/simulations/new', labelKey: 'sidebar.newSimulation', icon: '➕' },
  { to: '/values', labelKey: 'sidebar.values', icon: '💎' },
  { to: '/billing', labelKey: 'sidebar.billing', icon: '💳' },
  { to: '/settings', labelKey: 'sidebar.settings', icon: '🔧' },
  { to: '/system', labelKey: 'sidebar.systemStatus', icon: '⚙️' },
] as const;

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

export function Sidebar({ collapsed, onToggle, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const logout = useLogout();

  return (
    <aside className={`flex h-full flex-col border-r border-border bg-surface-elevated transition-all ${collapsed ? 'w-16' : 'w-56'}`}>
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        {!collapsed && <span className="text-lg font-bold text-primary">ChronoSynth</span>}
        <div className="flex gap-1">
          {onClose && (
            <button
              onClick={onClose}
              className="rounded p-1 text-text-secondary hover:bg-surface lg:hidden"
              aria-label={t('sidebar.closeNav')}
            >
              ✕
            </button>
          )}
          <button
            onClick={onToggle}
            className="hidden rounded p-1 text-text-secondary hover:bg-surface lg:block"
            aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>
      </div>
      <nav className="flex-1 p-2" aria-label={t('sidebar.mainNav')}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            aria-label={collapsed ? t(item.labelKey) : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary'
              }`
            }
          >
            <span className="text-base" aria-hidden="true">{item.icon}</span>
            {!collapsed && <span>{t(item.labelKey)}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        {!collapsed && <div className="mb-2"><LanguageSwitcher /></div>}
        {isAuthenticated && (
          <>
            {!collapsed && user && (
              <p className="mb-2 truncate text-xs text-text-secondary" title={user.email}>
                {user.email}
              </p>
            )}
            <button
              onClick={() => logout.mutate()}
              aria-label={t('sidebar.logout')}
              title={collapsed ? t('sidebar.logout') : undefined}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary"
            >
              <span aria-hidden="true">🚪</span>
              {!collapsed && <span>{t('sidebar.logout')}</span>}
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
