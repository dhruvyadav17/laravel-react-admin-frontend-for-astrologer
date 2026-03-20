import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <h2>Welcome to Astro Platform</h2>

      <div style={{ marginTop: 30 }}>
        <Link to="/login">
          <button className="btn btn-primary">
            User Login
          </button>
        </Link>

        <Link
          to="/admin/login"
          style={{ marginLeft: 10 }}
        >
          <button className="btn btn-dark">
            Admin Login
          </button>
        </Link>
      </div>
    </div>
  );
}