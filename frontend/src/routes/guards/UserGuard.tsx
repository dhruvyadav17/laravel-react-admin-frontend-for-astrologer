import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";

export default function UserGuard() {
  const { isAuth, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuth) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}