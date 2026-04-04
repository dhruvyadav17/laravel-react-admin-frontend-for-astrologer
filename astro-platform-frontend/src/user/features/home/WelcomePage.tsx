// PATH: src/user/features/home/WelcomePage.tsx
// FIX BUG-21: <Link><button> — invalid HTML (button inside anchor tag)
//              Browser warnings + accessibility issues
//              Fix: Link ko directly button styling dedo — no nested button

import { Link } from "react-router-dom";

export default function WelcomePage() {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="app-card text-center px-4 py-5" style={{ maxWidth: 420, width: "100%" }}>

        <h2 className="fw-bold mb-2">🔱 Astro</h2>
        <p className="text-muted mb-4">Choose your access to continue</p>

        {/* FIX BUG-21: Link directly styled — no <button> inside <Link> */}
        <div className="d-grid gap-3">
          <Link
            to="/home"
            className="btn btn-primary-app btn-app w-100"
          >
            👤 Continue as User
          </Link>

          <Link
            to="/admin/login"
            className="btn btn-outline-app btn-app w-100"
          >
            🛠 Admin Login
          </Link>

          <Link
            to="/login"
            className="btn btn-outline-secondary btn-sm w-100"
          >
            Sign in to your account
          </Link>
        </div>

        <p className="text-muted small mt-4 mb-0">
          Astrology platform for guidance & insights
        </p>

      </div>
    </div>
  );
}
