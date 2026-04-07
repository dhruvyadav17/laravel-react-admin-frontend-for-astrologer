// PATH: src/pages/auth/ForgotPassword.tsx
// IMPROVEMENT: Pehle toast sirf dikhta tha — user baar baar submit karta tha
//              Ab sent state — "check your email" screen dikhta hai after submit
//              Resend option bhi diya
// IMPROVEMENT: Back to login link add kiya

import { useState }        from "react";
import { Link }            from "react-router-dom";
import api                 from "../../core/api/axios";
import { showError }       from "../../utils/feedback";

export default function ForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post("/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.errors?.email?.[0] ||
        err?.response?.data?.message ||
        "Unable to send reset link. Please try again.";
      setError(msg);
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Sent state ───────────────────────────────── */
  if (sent) {
    return (
      <div className="container mt-5 text-center" style={{ maxWidth: 420 }}>
        <i className="fas fa-envelope-open text-primary fa-3x mb-3 d-block" />
        <h5 className="fw-bold">Check your inbox</h5>
        <p className="text-muted">
          We've sent a password reset link to{" "}
          <strong>{email}</strong>.
          Click the link in the email to reset your password.
        </p>
        <p className="text-muted small">
          Didn't receive it? Check your spam folder or{" "}
          <button
            className="btn btn-link btn-sm p-0 text-decoration-none"
            onClick={() => { setSent(false); setError(null); }}
          >
            try again
          </button>.
        </p>
        <Link to="/login" className="btn btn-outline-primary mt-2">
          Back to Login
        </Link>
      </div>
    );
  }

  /* ── Form ─────────────────────────────────────── */
  return (
    <div className="container mt-5" style={{ maxWidth: 420 }}>
      <h4 className="mb-1 fw-bold">Forgot Password</h4>
      <p className="text-muted small mb-4">
        Enter your email and we'll send you a reset link.
      </p>

      {error && (
        <div className="alert alert-danger py-2 small">
          <i className="fas fa-exclamation-circle me-2" />
          {error}
        </div>
      )}

      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label small fw-semibold">Email Address</label>
          <input
            type="email"
            className={`form-control ${error ? "border-danger" : ""}`}
            placeholder="your@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            disabled={loading}
            required
            autoComplete="email"
          />
        </div>

        <button
          className="btn btn-primary w-100 mb-3"
          disabled={loading}
        >
          {loading ? (
            <><span className="spinner-border spinner-border-sm me-2" />Sending...</>
          ) : (
            <><i className="fas fa-paper-plane me-2" />Send Reset Link</>
          )}
        </button>

        <div className="text-center">
          <Link to="/login" className="small text-muted">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}
