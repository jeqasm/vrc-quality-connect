import { hasPermission } from './access-check';
import { accessPermissions, AccessPermission } from './access-permissions';

export type NavigationItem = {
  to: string;
  label: string;
  permission: AccessPermission | null;
};

const navigationItems: NavigationItem[] = [
  { to: '/', label: 'Главная', permission: accessPermissions.dashboardView },
  { to: '/activity-records', label: 'Учет активности', permission: accessPermissions.activityRecordsView },
  { to: '/reports', label: 'Отчеты', permission: accessPermissions.reportsView },
  { to: '/support-requests', label: 'Поддержка', permission: accessPermissions.supportRequestsView },
  { to: '/settings', label: 'Настройки', permission: null },
];

export function getVisibleNavigationItems(permissions: string[]): NavigationItem[] {
  return navigationItems.filter(
    (item) => item.permission === null || hasPermission(permissions, item.permission),
  );
}

export function getFirstAccessiblePath(permissions: string[]): string {
  const firstItem = getVisibleNavigationItems(permissions)[0];
  return firstItem?.to ?? '/settings';
}

