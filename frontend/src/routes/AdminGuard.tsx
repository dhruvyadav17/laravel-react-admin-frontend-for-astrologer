import { Navigate, Outlet }    from 'react-router-dom';
import { useAuth }              from '../modules/auth/hooks/useAuth';
import { resolveLoginRedirect } from '../utils/authRedirect';

export default function AdminGuard() {
  const { isAuth, isAdmin, user, loading } = useAuth();
  if (loading) return <div className="d-flex justify-content-center align-items-center min-vh-100"><div className="spinner-border text-primary" /></div>;
  if (!isAuth)  return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to={resolveLoginRedirect(user)} replace />;
  return <Outlet />;
}
