import { NavLink, Outlet } from 'react-router-dom';

import { getVisibleNavigationItems } from '../../modules/access/model/access-navigation';
import { useAuth } from '../../modules/auth/providers/auth-provider';

export function AppShell() {
  const auth = useAuth();
  const currentAccount = auth.account;
  const navigationItems = currentAccount ? getVisibleNavigationItems(currentAccount.permissions) : [];

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
              Выйти из аккаунта
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
