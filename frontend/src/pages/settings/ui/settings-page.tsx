import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';

export function SettingsPage() {
  return (
    <div className="page-grid">
      <PageHeader title="Настройки" subtitle="Страница заложена как точка роста для конфигурации и справочников." />
      <div className="content-card">
        <EmptyState
          title="No settings panels yet"
          message="Настройки будут добавлены после базовых операционных сценариев."
        />
      </div>
    </div>
  );
}
