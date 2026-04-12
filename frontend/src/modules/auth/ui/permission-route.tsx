import { Navigate, Outlet } from 'react-router-dom';

import { hasPermission } from '../../access/model/access-check';
import { useAuth } from '../providers/auth-provider';

export function PermissionRoute(props: { permission: string; fallbackPath?: string }) {
  const auth = useAuth();

  if (!auth.account) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(auth.account.permissions, props.permission)) {
    return <Navigate to={props.fallbackPath ?? '/'} replace />;
  }

  return <Outlet />;
}
