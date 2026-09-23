import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { homeFor, useAuth } from '../../context/AuthContext';
import { PageLoader } from './Loader';

/** Only lets users with one of `roles` through (role-based access control on the client). */
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) {
    const loginPath = roles?.includes('admin') && roles.length === 1 ? '/admin/login' : '/login';
    return <Navigate to={loginPath} replace state={{ from: location.pathname + location.search }} />;
  }
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user)} replace />;
  return <Outlet />;
}
