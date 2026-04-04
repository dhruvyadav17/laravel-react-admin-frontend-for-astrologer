// PATH: src/auth/LoginForm.tsx
// FIX BUG-11: Props mein onSuccess missing tha — Login.tsx pass karta tha, LoginForm ignore karta tha
//              Login.tsx ka onSuccess kabhi call nahi hota tha (LoginForm apna navigate karta tha)
//              Ab LoginForm onSuccess call karta hai → Login.tsx ka redirect logic kaam karega
// IMPROVEMENT: Show password toggle button add kiya
// IMPROVEMENT: Error inline dikhao (toast ke baad bhi form mein highlight)

import { useState }     from "react";
import { useDispatch }  from "react-redux";
import { Link }         from "react-router-dom";

import { loginThunk, fetchProfileThunk } from "../store/authSlice";
import type { AppDispatch }              from "../store";
import type { User }                     from "../types/models";
import { showError }                     from "../utils/feedback";

type Props = {
  title:      string;
  onSuccess?: (user: User) => void;  // FIX BUG-11: missing tha
};

export default function LoginForm({ title, onSuccess }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);  // IMPROVEMENT
  const [loading,     setLoading]     = useState(false);
  const [errorMsg,    setErrorMsg]    = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const loginRes = await dispatch(loginThunk({ email, password }));

      if (loginThunk.rejected.match(loginRes)) {
        const msg = (loginRes.payload as string) || "Invalid credentials";
        setErrorMsg(msg);
        showError(msg);
        return;
      }

      const profileRes = await dispatch(fetchProfileThunk());

      if (fetchProfileThunk.rejected.match(profileRes)) {
        const msg = "Failed to load profile. Please try again.";
        setErrorMsg(msg);
        showError(msg);
        return;
      }

      const user = profileRes.payload?.user ?? null;

      if (!user) {
        setErrorMsg("Invalid profile response");
        showError("Invalid profile response");
        return;
      }

      // FIX BUG-11: onSuccess call karo — Login.tsx ka redirect logic trigger hoga
      onSuccess?.(user);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 420 }}>
      <h4 className="mb-4 text-center fw-bold">{title}</h4>

      {/* IMPROVEMENT: Inline error alert */}
      {errorMsg && (
        <div className="alert alert-danger py-2 small" role="alert">
          <i className="fas fa-exclamation-circle me-2" />
          {errorMsg}
        </div>
      )}

      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label small fw-semibold">Email Address</label>
          <input
            className={`form-control ${errorMsg ? "border-danger" : ""}`}
            type="email"
            placeholder="your@email.com"
            value={email}
            required
            autoComplete="email"
            onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
          />
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold">Password</label>
          {/* IMPROVEMENT: Show/hide password toggle */}
          <div className="input-group">
            <input
              className={`form-control ${errorMsg ? "border-danger" : ""}`}
              type={showPass ? "text" : "password"}
              placeholder="Your password"
              value={password}
              required
              autoComplete="current-password"
              onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }}
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
        </div>

        <button
          className="btn btn-primary w-100 mb-3"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>

        <div className="d-flex justify-content-between align-items-center">
          <Link to="/forgot-password" className="small text-muted">
            Forgot password?
          </Link>
          <Link to="/register" className="small">
            Create account
          </Link>
        </div>
      </form>
    </div>
  );
}
