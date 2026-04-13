//   isAdmin check existed but isAstrologer check was missing
//   Astrologer /profile, /consultations, /favorites open ho jaate the

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth }                        from '../../auth/hooks/useAuth';

export default function UserGuard() {
  const { isAuth, isAdmin, isAstrologer } = useAuth();
  const location                           = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // FIX F3: Astrologer -> astrologer portal
  if (isAstrologer) {
    return <Navigate to="/astrologer/dashboard" replace />;
  }

  return <Outlet />;
}
