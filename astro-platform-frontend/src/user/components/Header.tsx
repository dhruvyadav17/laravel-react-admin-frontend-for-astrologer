import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { useLogout } from "../../auth/hooks/useLogout";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const { user, isAuth } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  /* 🔥 CLOSE DROPDOWN ON OUTSIDE CLICK */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  /* 🔥 ACTIVE LINK */
  const isActive = (path: string) =>
    location.pathname === path ? "fw-bold text-warning" : "text-white";

  return (
    <header className="app-header bg-danger text-white shadow-sm">
      <div className="container d-flex justify-content-between align-items-center py-3">

        {/* LOGO */}
        <Link to="/" className="fw-bold fs-5 text-white text-decoration-none">
          🔱 AstroPandit
        </Link>

        {/* NAV */}
        <nav className="d-flex gap-4 fw-medium">
          <Link to="/" className={isActive("/")}>Home</Link>
          <Link to="/panchang" className={isActive("/panchang")}>Panchang</Link>
          <Link to="/astrologers" className={isActive("/astrologers")}>Astrologers</Link>
        </nav>

        {/* USER */}
        {!isAuth ? (
          <Link to="/login" className="btn btn-light btn-sm">
            Login
          </Link>
        ) : (
          <div ref={ref} className="position-relative">

            {/* USER BUTTON */}
            <button
              className="btn text-white d-flex align-items-center gap-2"
              onClick={() => setOpen((v) => !v)}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || "User"
                )}&background=fff&color=dc3545`}
                alt="avatar"
                width={32}
                height={32}
                className="rounded-circle"
              />
              <span>{user?.name}</span>
            </button>

            {/* DROPDOWN */}
            {open && (
              <div
                className="app-card position-absolute end-0 mt-2 shadow"
                style={{ minWidth: 180, zIndex: 1000 }}
              >

                <button
                  className="dropdown-item"
                  onClick={() => {
                    navigate("/profile");
                    setOpen(false);
                  }}
                >
                  👤 Profile
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => {
                    navigate("/panchang");
                    setOpen(false);
                  }}
                >
                  📅 Panchang
                </button>

                <div className="dropdown-divider" />

                <button
                  className="dropdown-item text-danger"
                  onClick={() => logout("/")}
                >
                  🚪 Logout
                </button>

              </div>
            )}

          </div>
        )}

      </div>
    </header>
  );
}