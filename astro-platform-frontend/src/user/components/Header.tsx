// PATH: src/user/components/Header.tsx
// ADD: Mobile hamburger menu (Bootstrap classes only, no new library)
// ADD: Horoscope link in nav
// ADD: Favorites link in user dropdown
// ADD: Avatar component

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth }                         from "../../auth/hooks/useAuth";
import { useLogout }                       from "../../auth/hooks/useLogout";
import { useFavorites }                    from "../../hooks/useFavorites";
import { useState, useRef, useEffect }     from "react";
import Avatar                              from "../../components/ui/Avatar";

const NAV_LINKS = [
  { to: "/home",        label: "Home"       },
  { to: "/astrologers", label: "Astrologers"},
  { to: "/horoscope",   label: "Horoscope"  },
  { to: "/panchang",    label: "Panchang"   },
];

export default function Header() {
  const { user, isAuth }    = useAuth();
  const logout              = useLogout();
  const navigate            = useNavigate();
  const location            = useLocation();
  const { favorites }       = useFavorites();

  const [dropOpen, setDropOpen] = useState(false);
  const [navOpen,  setNavOpen]  = useState(false);   // mobile nav
  const dropRef = useRef<HTMLDivElement | null>(null);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!dropRef.current?.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  /* Close mobile nav on route change */
  useEffect(() => { setNavOpen(false); }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path ? "active" : "";

  const navTo = (path: string) => { navigate(path); setDropOpen(false); setNavOpen(false); };

  return (
    <header className="app-header shadow-sm">
      <div className="container py-3">
        <div className="d-flex justify-content-between align-items-center">

          {/* Logo */}
          <Link to="/home" className="fw-bold fs-5 text-white text-decoration-none">
            🔱 Astro
          </Link>

          {/* Desktop nav */}
          <nav className="d-none d-md-flex gap-4 fw-medium">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} className={`nav-link-custom ${isActive(to)}`}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="d-flex align-items-center gap-2">

            {/* Mobile hamburger */}
            <button
              className="btn btn-sm d-md-none text-white border-0 p-1"
              onClick={() => setNavOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <i className={`fas ${navOpen ? "fa-times" : "fa-bars"}`} style={{ fontSize: 18 }} />
            </button>

            {/* User section */}
            {!isAuth ? (
              <Link to="/login" className="btn btn-light btn-sm btn-app">Login</Link>
            ) : (
              <div ref={dropRef} className="position-relative">

                {/* User button */}
                <button
                  className="btn text-white d-flex align-items-center gap-2 p-1"
                  onClick={() => setDropOpen((v) => !v)}
                >
                  <Avatar
                    name={user?.name}
                    src={null}
                    size={32}
                    color="light"
                    className="text-danger"
                  />
                  <span className="fw-medium d-none d-md-inline">{user?.name}</span>
                  <i className="fas fa-chevron-down" style={{ fontSize: 10 }} />
                </button>

                {/* Dropdown */}
                {dropOpen && (
                  <div className="app-card position-absolute end-0 mt-2 py-1"
                    style={{ minWidth: 200, zIndex: 1000, borderRadius: 12 }}>

                    <button className="dropdown-item d-flex align-items-center gap-2"
                      onClick={() => navTo("/profile")}>
                      <i className="fas fa-user text-muted" style={{ width: 16 }} />
                      <span>My Profile</span>
                    </button>

                    <button className="dropdown-item d-flex align-items-center gap-2"
                      onClick={() => navTo("/favorites")}>
                      <i className="fas fa-heart text-danger" style={{ width: 16 }} />
                      <span>Saved Astrologers</span>
                      {favorites.length > 0 && (
                        <span className="badge bg-danger ms-auto">{favorites.length}</span>
                      )}
                    </button>

                    <button className="dropdown-item d-flex align-items-center gap-2"
                      onClick={() => navTo("/consultations")}>
                      <i className="fas fa-phone text-success" style={{ width: 16 }} />
                      <span>My Consultations</span>
                    </button>

                    <button className="dropdown-item d-flex align-items-center gap-2"
                      onClick={() => navTo("/horoscope")}>
                      <i className="fas fa-moon text-primary" style={{ width: 16 }} />
                      <span>Horoscope</span>
                    </button>

                    <button className="dropdown-item d-flex align-items-center gap-2"
                      onClick={() => navTo("/panchang")}>
                      <i className="fas fa-calendar-alt text-success" style={{ width: 16 }} />
                      <span>Panchang</span>
                    </button>

                    <div className="dropdown-divider" />

                    <button className="dropdown-item text-danger d-flex align-items-center gap-2"
                      onClick={() => logout("/")}>
                      <i className="fas fa-sign-out-alt" style={{ width: 16 }} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile nav — collapse */}
        {navOpen && (
          <nav className="d-md-none mt-3 border-top border-white border-opacity-25 pt-3">
            <div className="d-flex flex-column gap-2">
              {NAV_LINKS.map(({ to, label }) => (
                <Link key={to} to={to}
                  className={`nav-link-custom ${isActive(to)} py-1`}
                  onClick={() => setNavOpen(false)}>
                  {label}
                </Link>
              ))}
              {isAuth && (
                <>
                  <Link to="/favorites" className="nav-link-custom py-1"
                    onClick={() => setNavOpen(false)}>
                    ❤️ Saved ({favorites.length})
                  </Link>
                  <Link to="/profile" className="nav-link-custom py-1"
                    onClick={() => setNavOpen(false)}>
                    👤 My Profile
                  </Link>
                </>
              )}
              {!isAuth && (
                <Link to="/login" className="btn btn-light btn-sm btn-app w-100 mt-1">Login</Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}