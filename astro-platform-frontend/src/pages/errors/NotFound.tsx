// PATH: src/pages/errors/NotFound.tsx
// IMPROVEMENT: Generic error page ko proper 404 UI se replace kiya

import { Link, useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="text-center px-4" style={{ maxWidth: 480 }}>

        {/* Big 404 */}
        <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1, color: "#e63946", opacity: 0.15 }}>
          404
        </div>

        <i className="fas fa-search text-muted fa-3x d-block mb-3" style={{ marginTop: -20 }} />

        <h3 className="fw-bold mb-2">Page Not Found</h3>
        <p className="text-muted mb-4">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="d-flex gap-2 justify-content-center flex-wrap">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-arrow-left me-2" />Go Back
          </button>
          <Link to="/home" className="btn btn-primary">
            <i className="fas fa-home me-2" />Go Home
          </Link>
        </div>

      </div>
    </div>
  );
}
