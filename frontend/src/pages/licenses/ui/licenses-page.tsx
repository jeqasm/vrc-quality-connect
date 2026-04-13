import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { LicensesRegistryWorkspace } from '../../../modules/licenses/ui/licenses-registry-workspace';

export function LicensesPage() {
  return (
    <div className="page-grid">
      <PageHeader
        title="Лицензии"
        subtitle="Реестр ведется прямо в интерфейсе в табличном виде. Новые записи показываются сверху, старые уходят ниже."
      />
      <LicensesRegistryWorkspace />
    </div>
  );
}
