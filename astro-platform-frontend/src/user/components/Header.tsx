import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { useLogout } from "../../auth/hooks/useLogout";

export default function Header() {
  const { user, isAuth } = useAuth();
  const logout = useLogout();

  return (
    <header className="bg-danger text-white shadow-sm">
      <div className="container d-flex justify-content-between align-items-center py-3">

        {/* 🔱 LOGO */}
        <NavLink
          to="/"
          className="fw-bold text-white text-decoration-none fs-5"
        >
          🔱 AstroPandit
        </NavLink>

        {/* 🧭 NAV */}
        <nav className="d-flex gap-3 align-items-center">

          {/* ✅ ALWAYS */}
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>

          {/* 🔐 ONLY WHEN LOGIN */}
          {isAuth && (
            <>
              <NavLink to="/astrologers" className={navClass}>
                Astrologers
              </NavLink>

              <NavLink to="/panchang" className={navClass}>
                Panchang
              </NavLink>

              <NavLink to="/horoscope" className={navClass}>
                Horoscope
              </NavLink>
            </>
          )}
        </nav>

        {/* 👤 USER AREA */}
        <div className="d-flex align-items-center gap-2">

          {isAuth ? (
            <>
              {/* 👤 PROFILE */}
              <NavLink to="/profile" className={navClass}>
                👤 {user?.name}
              </NavLink>

              {/* 🚪 LOGOUT */}
              <button
                onClick={() => logout("/")}
                className="btn btn-sm btn-light"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn-light btn-sm">
              Login
            </NavLink>
          )}
        </div>

      </div>
    </header>
  );
}

/* 🔥 ACTIVE LINK STYLE */
const navClass = ({ isActive }: { isActive: boolean }) =>
  `text-white text-decoration-none ${
    isActive ? "fw-bold border-bottom border-white" : ""
  }`;