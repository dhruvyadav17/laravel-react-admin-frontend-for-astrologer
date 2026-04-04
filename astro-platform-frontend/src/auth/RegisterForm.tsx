// PATH: src/auth/RegisterForm.tsx
// IMPROVEMENT: Koi inline field validation nahi thi — sirf toast toast
//              Ab API 422 errors field-level mein dikhte hain (e.g. "email already taken")
//              Password show/hide toggle add kiya
//              Password match validation client-side
//              Back to login link

import { useState }             from "react";
import { useNavigate, Link }    from "react-router-dom";
import { registerService }      from "../services/authService";
import { showError, showSuccess } from "../utils/feedback";

type FieldErrors = {
  name?:     string[];
  email?:    string[];
  password?: string[];
};

export default function RegisterForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:                  "",
    email:                 "",
    password:              "",
    password_confirmation: "",
  });

  const [loading,    setLoading]    = useState(false);
  const [showPass,   setShowPass]   = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [matchError,  setMatchError]  = useState<string | null>(null);

  const set = (key: keyof typeof form, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    if (key === "password" || key === "password_confirmation") {
      setMatchError(null);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setMatchError(null);

    // Client-side password match
    if (form.password !== form.password_confirmation) {
      setMatchError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await registerService(form);
      showSuccess("Account created! Please verify your email.");
      navigate("/verify-email", { replace: true });
    } catch (error: any) {
      // 422 → field errors
      if (error?.response?.status === 422) {
        setFieldErrors(error.response.data?.errors ?? {});
      } else {
        showError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>

      {/* Name */}
      <div className="mb-3">
        <label className="form-label small fw-semibold">Full Name</label>
        <input
          className={`form-control ${fieldErrors.name ? "is-invalid" : ""}`}
          placeholder="Your full name"
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
        {fieldErrors.name && (
          <div className="invalid-feedback">{fieldErrors.name[0]}</div>
        )}
      </div>

      {/* Email */}
      <div className="mb-3">
        <label className="form-label small fw-semibold">Email Address</label>
        <input
          className={`form-control ${fieldErrors.email ? "is-invalid" : ""}`}
          type="email"
          placeholder="your@email.com"
          required
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          autoComplete="email"
        />
        {fieldErrors.email && (
          <div className="invalid-feedback">{fieldErrors.email[0]}</div>
        )}
      </div>

      {/* Password */}
      <div className="mb-3">
        <label className="form-label small fw-semibold">Password</label>
        <div className="input-group">
          <input
            className={`form-control ${fieldErrors.password || matchError ? "is-invalid" : ""}`}
            type={showPass ? "text" : "password"}
            placeholder="Min. 6 characters"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setShowPass((v) => !v)}
            tabIndex={-1}
          >
            <i className={`fas ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
          </button>
        </div>
        {fieldErrors.password && (
          <div className="invalid-feedback d-block">{fieldErrors.password[0]}</div>
        )}
        {form.password.length > 0 && form.password.length < 6 && (
          <div className="form-text text-danger">
            {6 - form.password.length} more characters needed
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="mb-4">
        <label className="form-label small fw-semibold">Confirm Password</label>
        <input
          className={`form-control ${matchError ? "is-invalid" : ""}`}
          type={showPass ? "text" : "password"}
          placeholder="Repeat your password"
          required
          value={form.password_confirmation}
          onChange={(e) => set("password_confirmation", e.target.value)}
          autoComplete="new-password"
        />
        {matchError && (
          <div className="invalid-feedback d-block">
            <i className="fas fa-exclamation-circle me-1" />
            {matchError}
          </div>
        )}
      </div>

      <button className="btn btn-primary w-100 mb-3" disabled={loading}>
        {loading ? (
          <><span className="spinner-border spinner-border-sm me-2" />Creating account...</>
        ) : (
          "Create Account"
        )}
      </button>

      <div className="text-center">
        <span className="small text-muted">Already have an account? </span>
        <Link to="/login" className="small">Sign in</Link>
      </div>

    </form>
  );
}
