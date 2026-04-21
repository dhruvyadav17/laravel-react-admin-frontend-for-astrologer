import { Navigate, useLocation, Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { resolveLoginRedirect } from '../../../utils/authRedirect';
import Loader from '../../../components/ui/Loader';

type Props = { admin?: boolean };

export default function Login({ admin = false }: Props) {
  const { isAuth, user, loading } = useAuth();
  const location = useLocation();
  const from     = (location.state as any)?.from?.pathname;

  if (loading) return <Loader />;

  // Already logged in — go to where they came from or their default portal
  if (isAuth) return <Navigate to={from ?? resolveLoginRedirect(user)} replace />;

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: 'var(--bg, #f8f9fa)' }}>
      <div style={{ width: '100%', maxWidth: 440, padding: '0 16px' }}>
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none">
            <span style={{ fontSize: 40 }}>🔮</span>
            <h4 className="fw-bold mt-2 mb-0">{admin ? 'Admin Portal' : 'Welcome Back'}</h4>
          </Link>
          <p className="t-muted small mt-1">
            {admin ? 'Sign in to manage the platform' : 'Sign in to continue your journey'}
          </p>
        </div>

        <div className="p-4 rounded-4 shadow-sm" style={{ background: 'var(--surf, #fff)', border: '1px solid var(--bdr, #e8eaed)' }}>
          <LoginForm admin={admin} />
        </div>

        {!admin && (
          <p className="text-center t-muted mt-3 mb-0" style={{ fontSize: 11 }}>
            <Link to="/about" className="text-decoration-none">About</Link>
            {' · '}
            <Link to="/privacy" className="text-decoration-none">Privacy</Link>
            {' · '}
            <Link to="/terms" className="text-decoration-none">Terms</Link>
          </p>
        )}
      </div>
    </div>
  );
}
