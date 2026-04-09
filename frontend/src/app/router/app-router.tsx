import { Navigate, Route, Routes } from 'react-router-dom';

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
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="/activity-records" element={<ActivityRecordsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/licenses" element={<LicensesPage />} />
        <Route path="/support-requests" element={<SupportRequestsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
