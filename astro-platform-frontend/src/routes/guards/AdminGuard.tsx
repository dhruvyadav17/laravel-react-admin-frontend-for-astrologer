import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";

export default function AdminGuard() {
  const { isAuth, isAdmin } = useAuth();

  // ❌ Not logged in → admin login
  if (!isAuth) {
    return <Navigate to="/admin/login" replace />;
  }

  // ❌ Logged in but NOT admin → redirect to frontend
  if (!isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  // ✅ Admin allowed
  return <Outlet />;
}