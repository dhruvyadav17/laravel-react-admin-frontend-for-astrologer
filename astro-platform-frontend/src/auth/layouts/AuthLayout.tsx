import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { resolveLoginRedirect } from "../../utils/authRedirect";

export default function AuthLayout() {
  const { isAuth, user } = useAuth();
  const location = useLocation();

  if (isAuth && user) {
    const isAdminLogin = location.pathname.includes("/admin");

    return (
      <Navigate
        to={resolveLoginRedirect(
          user,
          isAdminLogin ? "admin" : "user"
        )}
        replace
      />
    );
  }

  return (
    <div className="auth-wrapper d-flex align-items-center justify-content-center min-vh-100">
      <Outlet />
    </div>
  );
}