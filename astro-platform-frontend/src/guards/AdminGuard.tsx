import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/hooks/useAuth";

export default function AdminGuard() {
  const { isAuth, isAdmin } = useAuth();

  if (!isAuth) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
}
