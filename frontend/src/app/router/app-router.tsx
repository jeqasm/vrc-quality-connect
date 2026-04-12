import { Navigate, Route, Routes } from 'react-router-dom';

import { accessPermissions } from '../../modules/access/model/access-permissions';
import { AuthenticatedRoute } from '../../modules/auth/ui/authenticated-route';
import { PermissionRoute } from '../../modules/auth/ui/permission-route';
import { AuthLoginPage } from '../../pages/auth-login/ui/auth-login-page';
import { AuthRegisterPage } from '../../pages/auth-register/ui/auth-register-page';
import { AppShell } from '../../shared/ui/app-shell';
import { ActivityRecordsPage } from '../../pages/activity-records/ui/activity-records-page';
import { DashboardPage } from '../../pages/dashboard/ui/dashboard-page';
import { LicensesPage } from '../../pages/licenses/ui/licenses-page';
import { ReportsPage } from '../../pages/reports/ui/reports-page';
import { SettingsPage } from '../../pages/settings/ui/settings-page';
import { SupportRequestsPage } from '../../pages/support-requests/ui/support-requests-page';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<AuthLoginPage />} />
      <Route path="/register" element={<AuthRegisterPage />} />

      <Route element={<AuthenticatedRoute />}>
        <Route element={<AppShell />}>
          <Route element={<PermissionRoute permission={accessPermissions.dashboardView} />}>
            <Route index element={<DashboardPage />} />
          </Route>
          <Route element={<PermissionRoute permission={accessPermissions.activityRecordsView} />}>
            <Route path="/activity-records" element={<ActivityRecordsPage />} />
          </Route>
          <Route element={<PermissionRoute permission={accessPermissions.reportsView} />}>
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
          <Route element={<PermissionRoute permission={accessPermissions.licensesView} />}>
            <Route path="/licenses" element={<LicensesPage />} />
          </Route>
          <Route element={<PermissionRoute permission={accessPermissions.supportRequestsView} />}>
            <Route path="/support-requests" element={<SupportRequestsPage />} />
          </Route>
          <Route element={<PermissionRoute permission={accessPermissions.settingsView} />}>
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
