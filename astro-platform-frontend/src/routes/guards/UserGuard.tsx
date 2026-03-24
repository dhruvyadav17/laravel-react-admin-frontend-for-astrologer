import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";

export default function UserGuard() {
  const { isAuth, isAdmin } = useAuth();
  const location = useLocation();

  /* ❌ NOT LOGGED IN → redirect to login (with return path) */
  if (!isAuth) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }} // 🔥 remember where user came from
        replace
      />
    );
  }

  /* ❌ ADMIN trying to access user routes */
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  /* ✅ ALLOWED */
  return <Outlet />;
}