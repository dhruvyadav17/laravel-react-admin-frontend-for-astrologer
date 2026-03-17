import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container mt-5 text-center">
      <h2 className="mb-3">404 – Page Not Found</h2>

      <p className="text-muted">
        The page you are looking for does not exist.
      </p>

      <Link to="/login" className="btn btn-secondary mt-3">
        Go to Login
      </Link>
    </div>
  );
}
