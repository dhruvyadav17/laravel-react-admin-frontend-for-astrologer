import { Link } from "react-router-dom";
//import { useAuth } from "@/hooks/useAuth";
import { useAuth } from "../../auth/hooks/useAuth";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-danger text-white shadow-sm">
      <div className="container d-flex justify-content-between align-items-center py-3">

        {/* LOGO */}
        <Link to="/" className="fw-bold text-white text-decoration-none">
          🔱 AstroPandit
        </Link>

        {/* NAV */}
        <nav className="d-flex gap-3">

          <Link to="/" className="text-white">Home</Link>
          <Link to="/panchang" className="text-white">Panchang</Link>
          <Link to="/astrologers" className="text-white">Astrologers</Link>
          <Link to="/horoscope" className="text-white">Horoscope</Link>

        </nav>

        {/* USER */}
        <div>
          {user ? (
            <Link to="/profile" className="text-white">
              👤 {user.name}
            </Link>
          ) : (
            <Link to="/login" className="text-white">
              Login
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}