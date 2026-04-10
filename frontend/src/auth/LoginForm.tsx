// PATH: src/auth/LoginForm.tsx
// FIX F5: Error message parsing wrong
//   loginThunk rejectWithValue sends STRING directly
//   (payload as any)?.message → undefined on string
// FIX: typeof payload === 'string' check karo pehle

import { useState }                       from 'react';
import { useDispatch, useSelector }        from 'react-redux';
import { Link, useNavigate, useLocation }  from 'react-router-dom';
import { loginThunk, fetchProfileThunk }   from '../store/authSlice';
import type { RootState, AppDispatch }     from '../store';
import { resolveLoginRedirect }            from '../utils/authRedirect';

type Props = { title?: string; admin?: boolean };

export default function LoginForm({ admin = false }: Props) {
  const dispatch  = useDispatch<AppDispatch>();
  const navigate  = useNavigate();
  const location  = useLocation();
  const loading   = useSelector((s: RootState) => s.auth.loading);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const loginRes = await dispatch(loginThunk({ email, password }));

    if (loginThunk.rejected.match(loginRes)) {
      // FIX F5: payload is a string from rejectWithValue
      const payload = loginRes.payload;
      const msg =
        typeof payload === 'string'
          ? payload
          : (payload as any)?.message ?? 'Invalid email or password';
      setError(msg);
      return;
    }

    const profileRes = await dispatch(fetchProfileThunk());

    if (fetchProfileThunk.rejected.match(profileRes)) {
      setError('Could not load profile. Please try again.');
      return;
    }

    const user = (profileRes.payload as any)?.user ?? null;
    if (!user) { setError('Invalid profile response'); return; }

    const fromAdmin  = location.pathname.includes('/admin');
    const redirectTo = resolveLoginRedirect(user, fromAdmin ? 'admin' : 'user');
    navigate(redirectTo, { replace: true });
  };

  return (
    <form onSubmit={submit}>
      {error && (
        <div className="alert alert-danger py-2 small mb-3">
          <i className="fas fa-exclamation-circle me-2" />{error}
        </div>
      )}

      <div className="mb-3">
        <label className="form-label fw-semibold small">Email Address</label>
        <input className="form-control" type="email" placeholder="you@email.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          autoComplete="email" required />
      </div>

      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <label className="form-label fw-semibold small mb-0">Password</label>
          <div className="d-flex gap-3 align-items-center">
            <button type="button" className="btn btn-link btn-sm p-0 text-muted"
              onClick={() => setShowPw((v) => !v)}>
              <i className={`fas fa-eye${showPw ? '-slash' : ''} me-1`} style={{ fontSize: 12 }} />
              {showPw ? 'Hide' : 'Show'}
            </button>
            <Link to="/forgot-password" className="small text-decoration-none">Forgot?</Link>
          </div>
        </div>
        <input className="form-control" type={showPw ? 'text' : 'password'}
          placeholder="Your password" value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          autoComplete="current-password" required />
      </div>

      <button className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
        {loading
          ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</>
          : `Sign In${admin ? ' (Admin)' : ''}`}
      </button>

      {!admin && (
        <p className="text-center text-muted small mt-3 mb-0">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-decoration-none fw-semibold">Create free account</Link>
        </p>
      )}
    </form>
  );
}
