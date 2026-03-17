import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { resolveLoginRedirect } from "../../utils/authRedirect";

export default function AuthLayout() {
  const { isAuth, user } = useAuth();

  if (isAuth) {
    return (
      <Navigate
        to={resolveLoginRedirect(user, false)}
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
