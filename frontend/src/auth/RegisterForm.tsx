// PATH: src/auth/RegisterForm.tsx
// IMPROVE: Better UI, inline field errors, password show/hide, link to login

import { useState }          from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerService }   from "../services/authService";

type FieldErrors = Record<string, string>;

export default function RegisterForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", password: "", password_confirmation: "",
  });
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<FieldErrors>({});

  const set = (k: keyof typeof form, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client-side check
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: "Passwords do not match" });
      return;
    }

    try {
      setLoading(true);
      await registerService(form);
      navigate("/verify-email", { replace: true });
    } catch (err: any) {
      // 422 field errors from Laravel
      const errs = err?.response?.data?.errors;
      if (errs) {
        const flat: FieldErrors = {};
        Object.entries(errs).forEach(([k, v]) => {
          flat[k] = Array.isArray(v) ? v[0] : String(v);
        });
        setErrors(flat);
      } else {
        setErrors({ email: err?.response?.data?.message ?? "Registration failed" });
      }
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, key: keyof typeof form, type = "text", extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="mb-3">
      <label className="form-label fw-semibold small">{label}</label>
      <input
        {...extra}
        className={`form-control ${errors[key] ? "is-invalid" : ""}`}
        type={key.includes("password") ? (showPw ? "text" : "password") : type}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        required
      />
      {errors[key] && <div className="invalid-feedback">{errors[key]}</div>}
    </div>
  );

  return (
    <form onSubmit={submit}>
      {field("Full Name",        "name",                  "text",  { placeholder: "Rahul Sharma",    autoComplete: "name"     })}
      {field("Email Address",    "email",                 "email", { placeholder: "rahul@email.com", autoComplete: "email"    })}

      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <label className="form-label fw-semibold small mb-0">Password</label>
          <button type="button" className="btn btn-link btn-sm p-0 text-muted"
            onClick={() => setShowPw((v) => !v)}>
            <i className={`fas fa-eye${showPw ? "-slash" : ""} me-1`} style={{ fontSize: 12 }} />
            {showPw ? "Hide" : "Show"}
          </button>
        </div>
        <input
          className={`form-control ${errors.password ? "is-invalid" : ""}`}
          type={showPw ? "text" : "password"}
          placeholder="Min 6 characters"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          autoComplete="new-password"
          minLength={6}
          required
        />
        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
      </div>

      <div className="mb-4">
        <label className="form-label fw-semibold small">Confirm Password</label>
        <input
          className={`form-control ${errors.password_confirmation ? "is-invalid" : ""}`}
          type={showPw ? "text" : "password"}
          placeholder="Repeat password"
          value={form.password_confirmation}
          onChange={(e) => set("password_confirmation", e.target.value)}
          required
        />
        {errors.password_confirmation && (
          <div className="invalid-feedback">{errors.password_confirmation}</div>
        )}
      </div>

      <button className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
        {loading
          ? <><span className="spinner-border spinner-border-sm me-2" />Creating account...</>
          : "Create Free Account"}
      </button>

      <p className="text-center text-muted small mt-3 mb-0">
        Already have an account?{" "}
        <Link to="/login" className="text-decoration-none fw-semibold">Sign In</Link>
      </p>
    </form>
  );
}