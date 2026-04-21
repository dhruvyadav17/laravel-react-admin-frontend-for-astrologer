import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../modules/auth/hooks/useAuth';

/**
 * UserGuard — protects auth-only user routes.
 *
 * FIX: Removed isAstrologer redirect.
 * Astrologers can ALSO access /wallet, /profile, /consultations.
 * Only admin-level users are redirected to admin portal.
 */
export default function UserGuard() {
  const { isAuth, isAdmin } = useAuth();
  const location = useLocation();
  if (!isAuth) return <Navigate to="/login" state={{ from: location }} replace />;
  if (isAdmin)  return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
}
