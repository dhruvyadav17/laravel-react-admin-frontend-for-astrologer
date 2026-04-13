// IMPROVE: Register link add kiya, better visual

import { Link } from "react-router-dom";

export default function WelcomePage() {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ background: "linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)" }}>

      <div style={{ width: "100%", maxWidth: 440, padding: "0 16px" }}>

        {/* Logo */}
        <div className="text-center mb-5">
          <div style={{ fontSize: 64 }}>🔱</div>
          <h1 className="fw-bold text-white mb-1" style={{ fontSize: 32 }}>Astro</h1>
          <p className="text-white opacity-75 small">
            Certified astrologers . Instant consultation . 24/7
          </p>
        </div>

        {/* Card */}
        <div className="rounded-4 p-4 mb-3" style={{ background: "var(--surf)", border: "1px solid var(--bdr)", boxShadow: "var(--shadow-lg)" }}>
          <h5 className="fw-bold text-center mb-1">Get Started</h5>
          <p className="t-muted text-center small mb-4">
            Talk to verified astrologers on love, career &amp; life
          </p>

          <div className="d-grid gap-2">
            <Link to="/register"
              className="btn btn-lg fw-semibold"
              style={{ background: "#e63946", color: "#fff", borderRadius: 12 }}>
              ✨ Create Free Account
            </Link>
            <Link to="/login"
              className="btn btn-lg btn-outline-secondary fw-semibold"
              style={{ borderRadius: 12 }}>
              Sign In
            </Link>
          </div>

          <div className="text-center mt-3">
            <Link to="/home" className="t-muted small text-decoration-none">
              Browse as guest
            </Link>
          </div>
        </div>

        {/* Trust */}
        <div className="d-flex justify-content-center gap-4 text-white opacity-75 mb-4">
          {[["500+", "Astrologers"], ["50K+", "Users"], ["4.8★", "Rating"]].map(([val, lbl]) => (
            <div key={lbl} className="text-center">
              <div className="fw-bold">{val}</div>
              <div style={{ fontSize: 11 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Admin link */}
        <div className="text-center">
          <Link to="/admin/login"
            className="text-white opacity-25 small text-decoration-none"
            style={{ fontSize: 11 }}>
            Admin Access
          </Link>
        </div>

      </div>
    </div>
  );
}