import { NavLink, Outlet } from 'react-router-dom';

import { hasPermission } from '../../modules/access/model/access-check';
import { accessPermissions } from '../../modules/access/model/access-permissions';
import { useAuth } from '../../modules/auth/providers/auth-provider';

export function AppShell() {
  const auth = useAuth();
  const currentAccount = auth.account;
  const navigationItems = [
    { to: '/', label: 'Главная', permission: accessPermissions.dashboardView },
    {
      to: '/activity-records',
      label: 'Учет активности',
      permission: accessPermissions.activityRecordsView,
    },
    { to: '/reports', label: 'Отчеты', permission: accessPermissions.reportsView },
    {
      to: '/support-requests',
      label: 'Поддержка',
      permission: accessPermissions.supportRequestsView,
    },
    { to: '/settings', label: 'Настройки', permission: accessPermissions.settingsView },
  ].filter((item) => currentAccount && hasPermission(currentAccount.permissions, item.permission));

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-brand">
          <div className="app-brand-mark">VRC</div>
          <div className="app-brand-copy">
            <div className="app-brand-title">Quality Connect</div>
            <div className="app-brand-subtitle">Operations cockpit</div>
          </div>
        </div>

        <nav className="app-navigation">
          {navigationItems.map((item) => (
            <NavigationLink key={item.to} to={item.to}>
              {item.label}
            </NavigationLink>
          ))}
        </nav>

        {currentAccount ? (
          <div className="sidebar-footnote">
            <div className="sidebar-account-name">{currentAccount.user.fullName}</div>
            <div>{currentAccount.user.accessRole.name}</div>
            <div>{currentAccount.user.department.name}</div>
            <button type="button" className="ghost-button sidebar-logout" onClick={() => void auth.logout()}>
              Sign out
            </button>
          </div>
        ) : null}
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

function NavigationLink(props: { to: string; children: string }) {
  return (
    <NavLink
      to={props.to}
      end={props.to === '/'}
      className={({ isActive }) => `navigation-link${isActive ? ' navigation-link-active' : ''}`}
    >
      {props.children}
    </NavLink>
  );
}
