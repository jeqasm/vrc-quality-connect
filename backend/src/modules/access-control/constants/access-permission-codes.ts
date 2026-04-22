export const accessPermissionCodes = {
  dashboardView: 'dashboard.view',
  activityRecordsView: 'activity-records.view',
  activityRecordsCreate: 'activity-records.create',
  activityRecordsQaView: 'activity-records.qa.view',
  activityRecordsSupportView: 'activity-records.support.view',
  activityRecordsManagementView: 'activity-records.management.view',
  reportsView: 'reports.view',
  reportsQaView: 'reports.qa.view',
  reportsLicensesView: 'reports.licenses.view',
  reportsSupportView: 'reports.support.view',
  reportsManagementView: 'reports.management.view',
  licensesView: 'licenses.view',
  supportRequestsView: 'support-requests.view',
  usersManage: 'users.manage',
  groupsManage: 'groups.manage',
  accessControlManage: 'access-control.manage',
} as const;

export type AccessPermissionCode =
  (typeof accessPermissionCodes)[keyof typeof accessPermissionCodes];
