import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";

export default function UserGuard() {
  const { isAuth, isAdmin } = useAuth();

  // ❌ Not logged in → Welcome page
  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  // ❌ Admin block from frontend
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}