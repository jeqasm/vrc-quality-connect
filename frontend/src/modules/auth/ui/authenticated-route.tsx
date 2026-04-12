import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { useAuth } from '../providers/auth-provider';

export function AuthenticatedRoute() {
  const auth = useAuth();
  const location = useLocation();

  if (auth.isLoading) {
    return (
      <div className="page-grid">
        <EmptyState title="Loading account" message="Загружаем права и состав текущего аккаунта." />
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
