import { Link } from "react-router-dom";

export default function WelcomePage() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">

      <h2 className="mb-4">Welcome to Astro Platform 🔱</h2>

      <div className="d-flex gap-3">
        <Link to="/login">
          <button className="btn btn-danger">
            User Login
          </button>
        </Link>

        <Link to="/admin/login">
          <button className="btn btn-dark">
            Admin Login
          </button>
        </Link>
      </div>

    </div>
  );
}