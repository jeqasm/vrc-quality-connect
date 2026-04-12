import { Link } from 'react-router-dom';

import { EmptyState } from '../../../shared/ui/empty-state/empty-state';

export function AccessDeniedView() {
  return (
    <div className="page-grid">
      <EmptyState
        title="Access denied"
        message="Для этого раздела у текущего аккаунта пока нет назначенных прав. Доступ должен выдаваться через роль и группы."
        action={
          <Link to="/" className="secondary-button">
            Вернуться на главную
          </Link>
        }
      />
    </div>
  );
}
