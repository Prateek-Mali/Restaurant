import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function ProtectedRoute({ roles, redirectTo, children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || (roles && !roles.includes(user.role))) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
