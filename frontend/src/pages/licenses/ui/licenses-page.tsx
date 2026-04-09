import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';

export function LicensesPage() {
  return (
    <div className="page-grid">
      <PageHeader title="Лицензии" subtitle="Модуль заложен каркасом для последующего развития." />
      <div className="content-card">
        <EmptyState
          title="No license operations yet"
          message="Лицензионные операции будут добавлены отдельным этапом."
        />
      </div>
    </div>
  );
}
