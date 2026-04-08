// PATH: src/pages/auth/Login.tsx

import { Navigate, useLocation, Link } from "react-router-dom";
import LoginForm                        from "../../auth/LoginForm";
import { useAuth }                      from "../../auth/hooks/useAuth";
import { resolveLoginRedirect }         from "../../utils/authRedirect";
import Loader                           from "@/components/ui/Loader";

type Props = { admin?: boolean };

export default function Login({ admin = false }: Props) {
  const { isAuth, user, loading } = useAuth();
  const location = useLocation();
  const from     = location.state?.from?.pathname;

  if (loading) return <Loader />;

  if (isAuth) {
    return (
      <Navigate
        to={from && !admin ? from : resolveLoginRedirect(user, admin ? "admin" : "user")}
        replace
      />
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ background: "#f8f9fa" }}>
      <div style={{ width: "100%", maxWidth: 440, padding: "0 16px" }}>

        {/* Header */}
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none">
            <span style={{ fontSize: 40 }}>🔱</span>
            <h4 className="fw-bold mt-2 mb-0">
              {admin ? "Admin Portal" : "Welcome Back"}
            </h4>
          </Link>
          <p className="text-muted small mt-1">
            {admin
              ? "Sign in to manage the platform"
              : "Sign in to continue your journey"}
          </p>
        </div>

        {/* Form card */}
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 16 }}>
          <LoginForm title={admin ? "Admin Login" : "User Login"} admin={admin} />
        </div>

        {!admin && (
          <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: 11 }}>
            <Link to="/about" className="text-decoration-none">About Astro</Link>
            {" · "}
            <Link to="/privacy" className="text-decoration-none">Privacy</Link>
            {" · "}
            <Link to="/terms" className="text-decoration-none">Terms</Link>
          </p>
        )}

      </div>
    </div>
  );
}