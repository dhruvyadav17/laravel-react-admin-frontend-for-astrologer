import { useDispatch, useSelector }       from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm }                         from 'react-hook-form';
import { zodResolver }                     from '@hookform/resolvers/zod';
import { useState }                        from 'react';
import { loginThunk, fetchProfileThunk }   from '../store/authSlice';
import type { RootState, AppDispatch }     from '../store';
import { resolveLoginRedirect }            from '../utils/authRedirect';
import { loginSchema, type LoginData }     from '../schemas/auth.schema';

type Props = { admin?: boolean };

export default function LoginForm({ admin = false }: Props) {
  const dispatch  = useDispatch<AppDispatch>();
  const navigate  = useNavigate();
  const location  = useLocation();
  const loading   = useSelector((s: RootState) => s.auth.loading);
  const [showPw, setShowPw]   = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',  // validate on blur
  });

  const onSubmit = async (data: LoginData) => {
    setServerError('');

    const loginRes = await dispatch(loginThunk(data));

    if (loginThunk.rejected.match(loginRes)) {
      const payload = loginRes.payload;
      setServerError(
        typeof payload === 'string'
          ? payload
          : (payload as any)?.message ?? 'Invalid email or password'
      );
      return;
    }

    const profileRes = await dispatch(fetchProfileThunk());
    if (fetchProfileThunk.rejected.match(profileRes)) {
      setServerError('Could not load profile. Please try again.');
      return;
    }

    const user       = (profileRes.payload as any)?.user ?? null;
    const fromAdmin  = location.pathname.includes('/admin');
    const redirectTo = resolveLoginRedirect(user, fromAdmin ? 'admin' : 'user');
    navigate(redirectTo, { replace: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && (
        <div className="d-flex align-items-start gap-2 px-3 py-2 rounded-3 small mb-3" style={{ background: "rgba(239,68,68,.10)", border: "1px solid rgba(239,68,68,.3)", color: "#dc2626" }}>
          <i className="fas fa-exclamation-circle me-2" />{serverError}
        </div>
      )}

      {/* Email */}
      <div className="mb-3">
        <label className="form-label fw-semibold small">Email Address</label>
        <input
          {...register('email')}
          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
          type="email"
          placeholder="you@email.com"
          autoComplete="email"
        />
        {errors.email && (
          <div className="invalid-feedback">{errors.email.message}</div>
        )}
      </div>

      {/* Password */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <label className="form-label fw-semibold small mb-0">Password</label>
          <div className="d-flex gap-3 align-items-center">
            <button type="button" className="btn btn-link btn-sm p-0 t-muted"
              onClick={() => setShowPw(v => !v)}>
              <i className={`fas fa-eye${showPw ? '-slash' : ''} me-1`} style={{ fontSize: 12 }} />
              {showPw ? 'Hide' : 'Show'}
            </button>
            <Link to="/forgot-password" className="small text-decoration-none">Forgot?</Link>
          </div>
        </div>
        <input
          {...register('password')}
          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
          type={showPw ? 'text' : 'password'}
          placeholder="Your password"
          autoComplete="current-password"
        />
        {errors.password && (
          <div className="invalid-feedback">{errors.password.message}</div>
        )}
      </div>

      <button
        className="btn btn-primary w-100 py-2 fw-semibold"
        disabled={loading || !isValid}
      >
        {loading
          ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</>
          : `Sign In${admin ? ' (Admin)' : ''}`}
      </button>

      {!admin && (
        <p className="text-center t-muted small mt-3 mb-0">
          Don't have an account?{' '}
          <Link to="/register" className="text-decoration-none fw-semibold">Create free account</Link>
        </p>
      )}
    </form>
  );
}
