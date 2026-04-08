// PATH: src/routes/guards/AdminGuard.tsx
// FIX BUG-23: !isAdmin → Navigate to="/profile" galat tha
//              Astrologer admin page access kare → /profile pe jaata tha (generic)
//              Fix: resolveLoginRedirect use karo — astrologer → /astrologer/dashboard
//                                                    user → /home
// IMPROVEMENT: loading state handle kiya — flickering prevent

import { Navigate, Outlet } from "react-router-dom";
import { useAuth }          from "../../auth/hooks/useAuth";
import { resolveLoginRedirect } from "../../utils/authRedirect";

export default function AdminGuard() {
  const { isAuth, isAdmin, user, loading } = useAuth();

  // Auth loading — don't redirect yet
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  // Not logged in → admin login
  if (!isAuth) {
    return <Navigate to="/admin/login" replace />;
  }

  // FIX BUG-23: Not admin → use resolveLoginRedirect for correct redirect
  // Before: always → /profile (wrong for astrologer)
  // After:  astrologer → /astrologer/dashboard | user → /home
  if (!isAdmin) {
    const redirectTo = resolveLoginRedirect(user, "user");
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
