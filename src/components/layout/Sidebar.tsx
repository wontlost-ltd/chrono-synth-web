import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/dashboard', label: '仪表盘', icon: '📊' },
  { to: '/simulations/new', label: '新建模拟', icon: '➕' },
  { to: '/values', label: '价值观', icon: '💎' },
  { to: '/system', label: '系统状态', icon: '⚙️' },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

export function Sidebar({ collapsed, onToggle, onClose }: SidebarProps) {
  return (
    <aside className={`flex h-full flex-col border-r border-border bg-surface-elevated transition-all ${collapsed ? 'w-16' : 'w-56'}`}>
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        {!collapsed && <span className="text-lg font-bold text-primary">ChronoSynth</span>}
        <div className="flex gap-1">
          {onClose && (
            <button
              onClick={onClose}
              className="rounded p-1 text-text-secondary hover:bg-surface lg:hidden"
              aria-label="关闭导航"
            >
              ✕
            </button>
          )}
          <button
            onClick={onToggle}
            className="hidden rounded p-1 text-text-secondary hover:bg-surface lg:block"
            aria-label={collapsed ? '展开侧边栏' : '折叠侧边栏'}
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>
      </div>
      <nav className="flex-1 p-2" aria-label="主导航">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            aria-label={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary'
              }`
            }
          >
            <span className="text-base" aria-hidden="true">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
