import { Link } from "react-router-dom";

export default function WelcomePage() {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">

      <div className="app-card text-center px-4 py-5" style={{ maxWidth: 420, width: "100%" }}>

        {/* LOGO / TITLE */}
        <h2 className="fw-bold mb-2">
          🔱 Astro
        </h2>

        <p className="text-muted mb-4">
          Choose your access to continue
        </p>

        {/* ACTIONS */}
        <div className="d-grid gap-3">

          {/* USER */}
          <Link to="/login">
            <button className="btn btn-primary-app btn-app w-100">
              👤 User Login
            </button>
          </Link>

          {/* ADMIN */}
          <Link to="/admin/login">
            <button className="btn btn-outline-app btn-app w-100">
              🛠 Admin Login
            </button>
          </Link>

        </div>

        {/* FOOT NOTE */}
        <p className="text-muted small mt-4 mb-0">
          Astrology platform for guidance & insights
        </p>

      </div>

    </div>
  );
}