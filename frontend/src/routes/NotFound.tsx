import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../modules/auth/hooks/useAuth';

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuth, isAstrologer } = useAuth();

  const home = isAstrologer ? '/astrologer/dashboard' : isAuth ? '/home' : '/';

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: 'var(--bg)' }}>
      <div className="text-center px-3">
        {/* Big 404 */}
        <div style={{ fontSize: 120, lineHeight: 1, fontWeight: 900, color: 'var(--bdr2)' }}>
          404
        </div>
        <div style={{ fontSize: 48, marginTop: -20 }}>🔍</div>

        <h3 className="fw-bold t-main mt-3 mb-2">Page Not Found</h3>
        <p className="t-muted mb-4" style={{ maxWidth: 380, margin: '0 auto 24px' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="d-flex gap-2 justify-content-center flex-wrap">
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left me-2" />Go Back
          </button>
          <Link to={home} className="btn btn-primary-app px-4">
            <i className="fas fa-home me-2" />Go Home
          </Link>
          <Link to="/astrologers" className="btn btn-outline-app px-4">
            <i className="fas fa-star me-2" />Find Astrologer
          </Link>
        </div>

        <p className="t-muted mt-4" style={{ fontSize: 12 }}>
          Need help?{' '}
          <Link to="/contact" style={{ color: 'var(--primary)' }}>Contact Support</Link>
        </p>
      </div>
    </div>
  );
}
