export const accessPermissions = {
  dashboardView: 'dashboard.view',
  activityRecordsView: 'activity-records.view',
  reportsView: 'reports.view',
  reportsQaView: 'reports.qa.view',
  reportsLicensesView: 'reports.licenses.view',
  reportsSupportView: 'reports.support.view',
  reportsManagementView: 'reports.management.view',
  licensesView: 'licenses.view',
  supportRequestsView: 'support-requests.view',
  settingsView: 'settings.view',
  usersManage: 'users.manage',
  groupsManage: 'groups.manage',
  accessControlManage: 'access-control.manage',
} as const;

export type AccessPermission = (typeof accessPermissions)[keyof typeof accessPermissions];
