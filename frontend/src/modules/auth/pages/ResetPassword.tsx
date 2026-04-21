
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useState }                           from "react";
import api                                    from "../../../api/axios";
import { execute }                            from "../../../utils/feedback";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token");
  const email = params.get("email");

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);

    const [matchError, setMatchError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMatchError(null);

        if (password.length < 6) {
      setMatchError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      setMatchError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await execute(
        () => api.post("/reset-password", {
          email,
          token,
          password,
          password_confirmation: confirm,
        }),
        { defaultMessage: "Password reset successfully! Please login." }
      );

      navigate("/login", { replace: true });
    } catch {
      // execute() handles toast internally
    } finally {
      setLoading(false);
    }
  };

  /* -- Invalid link ------------------------------- */
  if (!token || !email) {
    return (
      <div className="container mt-5 text-center" style={{ maxWidth: 420 }}>
        <i className="fas fa-times-circle text-danger fa-3x mb-3 d-block" />
        <h5>Invalid Reset Link</h5>
        <p className="t-muted">This link is invalid or has expired.</p>
        <Link to="/forgot-password" className="btn btn-outline-primary">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-5" style={{ maxWidth: 420 }}>
      <h4 className="mb-1 fw-bold">Reset Password</h4>
      <p className="t-muted small mb-4">Enter your new password below.</p>

      <form onSubmit={submit}>

        {/* New password */}
        <div className="mb-3">
          <label className="form-label small fw-semibold">New Password</label>
          <div className="input-group">
            <input
              type={showPass ? "text" : "password"}
              className={`form-control ${matchError ? "is-invalid" : ""}`}
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setMatchError(null); }}
              required
              minLength={6}
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
          {/* Strength hint */}
          {password.length > 0 && password.length < 6 && (
            <div className="form-text text-danger">
              {6 - password.length} more characters needed
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div className="mb-3">
          <label className="form-label small fw-semibold">Confirm Password</label>
          <input
            type={showPass ? "text" : "password"}
            className={`form-control ${matchError ? "is-invalid" : ""}`}
            placeholder="Repeat your password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setMatchError(null); }}
            required
          />
          
          {matchError && (
            <div className="invalid-feedback d-block">
              <i className="fas fa-exclamation-circle me-1" />
              {matchError}
            </div>
          )}
        </div>

        <button
          className="btn btn-success w-100"
          disabled={loading}
        >
          {loading ? (
            <><span className="spinner-border spinner-border-sm me-2" />Resetting...</>
          ) : (
            <><i className="fas fa-lock me-2" />Reset Password</>
          )}
        </button>

        <div className="text-center mt-3">
          <Link to="/login" className="small t-muted">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}
