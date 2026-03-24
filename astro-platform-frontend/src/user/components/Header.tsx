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

  /* ================= OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  /* ================= ACTIVE LINK ================= */
  const isActive = (path: string) =>
    location.pathname === path ? "active" : "";

  return (
    <header className="app-header shadow-sm">
      <div className="container d-flex justify-content-between align-items-center py-3">

        {/* ================= LOGO ================= */}
        <Link
          to="/"
          className="fw-bold fs-5 text-white text-decoration-none"
        >
          🔱 Astro
        </Link>

        {/* ================= NAV ================= */}
        <nav className="d-flex gap-4 fw-medium">

          <Link
            to="/"
            className={`nav-link-custom ${isActive("/")}`}
          >
            Home
          </Link>

          <Link
            to="/panchang"
            className={`nav-link-custom ${isActive("/panchang")}`}
          >
            Panchang
          </Link>

          <Link
            to="/astrologers"
            className={`nav-link-custom ${isActive("/astrologers")}`}
          >
            Astrologers
          </Link>

        </nav>

        {/* ================= USER ================= */}
        {!isAuth ? (
          <Link to="/login" className="btn btn-light btn-sm btn-app">
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
                )}&background=fff&color=e63946`}
                alt="avatar"
                width={32}
                height={32}
                className="rounded-circle"
              />
              <span className="fw-medium">{user?.name}</span>
            </button>

            {/* ================= DROPDOWN ================= */}
            {open && (
              <div
                className="app-card position-absolute end-0 mt-2"
                style={{
                  minWidth: 200,
                  zIndex: 1000,
                  borderRadius: 12,
                }}
              >

                {/* PROFILE */}
                <button
                  className="dropdown-item d-flex align-items-center gap-2"
                  onClick={() => {
                    navigate("/profile");
                    setOpen(false);
                  }}
                >
                  👤 <span>Profile</span>
                </button>

                {/* PANCHANG */}
                <button
                  className="dropdown-item d-flex align-items-center gap-2"
                  onClick={() => {
                    navigate("/panchang");
                    setOpen(false);
                  }}
                >
                  📅 <span>Panchang</span>
                </button>

                <div className="dropdown-divider" />

                {/* LOGOUT */}
                <button
                  className="dropdown-item text-danger d-flex align-items-center gap-2"
                  onClick={() => logout("/")}
                >
                  🚪 <span>Logout</span>
                </button>

              </div>
            )}

          </div>
        )}
      </div>
    </header>
  );
}