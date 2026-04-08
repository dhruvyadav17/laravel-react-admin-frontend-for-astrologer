// PATH: src/pages/auth/Register.tsx
// IMPROVE: Better layout matching Login page style

import { Link }        from "react-router-dom";
import RegisterForm    from "../../auth/RegisterForm";

export default function Register() {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ background: "#f8f9fa" }}>
      <div style={{ width: "100%", maxWidth: 440, padding: "0 16px" }}>

        {/* Header */}
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none">
            <span style={{ fontSize: 40 }}>🔱</span>
            <h4 className="fw-bold mt-2 mb-0">Join Astro</h4>
          </Link>
          <p className="text-muted small mt-1">
            Talk to verified astrologers on love, career & life
          </p>
        </div>

        {/* Form card */}
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 16 }}>
          <RegisterForm />
        </div>

        {/* Terms note */}
        <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: 11 }}>
          By registering you agree to our{" "}
          <Link to="/terms" className="text-decoration-none">Terms</Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-decoration-none">Privacy Policy</Link>
        </p>

      </div>
    </div>
  );
}