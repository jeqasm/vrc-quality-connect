import { IntegrationsHealthPanel } from '../../../modules/dashboard/ui/integrations-health-panel';
import { TopBar } from '../../../shared/ui/top-bar/top-bar';

export function DashboardPage() {
  return (
    <div className="page-grid">
      <TopBar
        title="Integrations health"
        subtitle="Integration connectors are intentionally isolated from domain logic. This panel tracks readiness for CRM, OpenProject, TestIT, and e-mail adapters."
      />
      <IntegrationsHealthPanel />
    </div>
  );
}
