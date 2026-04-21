import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { resolveLoginRedirect } from '../../../utils/authRedirect';

// Wraps all auth pages (/login, /register, etc.).
// Redirects already-authenticated users to their portal home.
export default function AuthLayout() {
  const { isAuth, user } = useAuth();

  if (isAuth && user) return <Navigate to={resolveLoginRedirect(user)} replace />;

  return (
    <div className="auth-wrapper d-flex align-items-center justify-content-center min-vh-100">
      <Outlet />
    </div>
  );
}
