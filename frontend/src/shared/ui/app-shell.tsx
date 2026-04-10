import { NavLink, Outlet } from 'react-router-dom';

export function AppShell() {
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
          <NavigationLink to="/">Главная</NavigationLink>
          <NavigationLink to="/activity-records">Учет активности</NavigationLink>
          <NavigationLink to="/reports">Отчеты</NavigationLink>
          <NavigationLink to="/licenses">Лицензии</NavigationLink>
          <NavigationLink to="/support-requests">Поддержка</NavigationLink>
          <NavigationLink to="/settings">Настройки</NavigationLink>
        </nav>
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
