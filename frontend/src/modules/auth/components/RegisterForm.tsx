import { useState }              from 'react';
import { Link, useNavigate }     from 'react-router-dom';
import { useForm }               from 'react-hook-form';
import { zodResolver }           from '@hookform/resolvers/zod';
import { registerService }       from '../services/authService';
import { registerSchema, type RegisterData } from '../schemas/auth.schema';

// Password strength calculator
function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8)              score++;
  if (/[A-Z]/.test(pw))            score++;
  if (/[a-z]/.test(pw))            score++;
  if (/[0-9]/.test(pw))            score++;
  if (/[^a-zA-Z0-9]/.test(pw))    score++;

  const map = [
    { label: '', color: '' },
    { label: 'Very Weak', color: '#ef4444' },
    { label: 'Weak',      color: '#f97316' },
    { label: 'Fair',      color: '#eab308' },
    { label: 'Good',      color: '#22c55e' },
    { label: 'Strong',    color: '#16a34a' },
  ];
  return { score, ...map[score] };
}

export default function RegisterForm() {
  const navigate           = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const pwValue  = watch('password', '');
  const strength = getStrength(pwValue);

  const onSubmit = async (data: RegisterData) => {
    setServerErrors({});
    try {
      await registerService(data);
      navigate('/login?registered=1');
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors ?? {};
      const mapped: Record<string, string> = {};
      Object.entries(apiErrors).forEach(([k, v]) => {
        mapped[k] = Array.isArray(v) ? v[0] : String(v);
      });
      if (Object.keys(mapped).length === 0) {
        mapped.general = err?.response?.data?.message ?? 'Registration failed. Try again.';
      }
      setServerErrors(mapped);
    }
  };

  const field = (name: keyof RegisterData, label: string, type = 'text', placeholder = '') => (
    <div className="mb-3">
      <label className="form-label fw-semibold small">{label}</label>
      <input
        {...register(name)}
        type={name.includes('password') ? (showPw ? 'text' : 'password') : type}
        className={`form-control ${errors[name] || serverErrors[name] ? 'is-invalid' : ''}`}
        placeholder={placeholder}
        autoComplete={name === 'email' ? 'email' : name.includes('password') ? 'new-password' : 'name'}
      />
      {(errors[name] || serverErrors[name]) && (
        <div className="invalid-feedback">
          {errors[name]?.message ?? serverErrors[name]}
        </div>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverErrors.general && (
        <div className="d-flex align-items-start gap-2 px-3 py-2 rounded-3 small mb-3" style={{ background: "rgba(239,68,68,.10)", border: "1px solid rgba(239,68,68,.3)", color: "#dc2626" }}>
          <i className="fas fa-exclamation-circle me-2" />{serverErrors.general}
        </div>
      )}

      {field('name',  'Full Name',  'text',  'Your full name')}
      {field('email', 'Email',      'email', 'you@email.com')}

      {/* Password with show/hide + strength */}
      <div className="mb-1">
        <div className="d-flex justify-content-between mb-1">
          <label className="form-label fw-semibold small mb-0">Password</label>
          <button type="button" className="btn btn-link btn-sm p-0 t-muted"
            onClick={() => setShowPw(v => !v)}>
            <i className={`fas fa-eye${showPw ? '-slash' : ''} me-1`} style={{ fontSize: 11 }} />
            {showPw ? 'Hide' : 'Show'}
          </button>
        </div>
        <input
          {...register('password')}
          type={showPw ? 'text' : 'password'}
          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
          placeholder="Min 8 chars, uppercase, number, symbol"
          autoComplete="new-password"
        />
        {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
      </div>

      {/* Strength bar */}
      {pwValue && (
        <div className="mb-3 mt-1">
          <div className="d-flex gap-1 mb-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{
                flex: 1, height: 4, borderRadius: 2,
                background: i <= strength.score ? strength.color : 'var(--bs-border-color)',
                transition: 'background .2s',
              }} />
            ))}
          </div>
          {strength.label && (
            <span style={{ fontSize: 11, color: strength.color }}>{strength.label}</span>
          )}
        </div>
      )}

      {field('password_confirmation', 'Confirm Password', 'password', 'Repeat your password')}

      <button
        className="btn btn-primary w-100 py-2 fw-semibold mt-1"
        disabled={isSubmitting || !isValid}
      >
        {isSubmitting
          ? <><span className="spinner-border spinner-border-sm me-2" />Creating account...</>
          : 'Create Account'}
      </button>

      <p className="text-center t-muted small mt-3 mb-0">
        Already have an account?{' '}
        <Link to="/login" className="text-decoration-none fw-semibold">Sign in</Link>
      </p>
    </form>
  );
}

