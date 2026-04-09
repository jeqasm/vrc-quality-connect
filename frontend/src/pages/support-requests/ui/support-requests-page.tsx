import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';

export function SupportRequestsPage() {
  return (
    <div className="page-grid">
      <PageHeader title="Обращения" subtitle="Модуль обращений заложен заранее, но пока не развивается как основной." />
      <div className="content-card">
        <EmptyState
          title="No support requests yet"
          message="Поддержка, intake channels и статусы обращений будут расширены позже."
        />
      </div>
    </div>
  );
}
