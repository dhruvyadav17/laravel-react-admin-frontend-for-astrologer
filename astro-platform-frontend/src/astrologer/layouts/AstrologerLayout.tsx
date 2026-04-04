import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { useLogout } from "../../auth/hooks/useLogout";
import { useMyAstrologerProfileQuery } from "../../store/api/astrologer.api";

const NAV_ITEMS = [
  { path: "/astrologer/dashboard", icon: "fa-tachometer-alt", label: "Dashboard" },
  { path: "/astrologer/profile",   icon: "fa-user-edit",      label: "My Profile" },
  { path: "/astrologer/schedule",  icon: "fa-calendar-alt",   label: "Schedule"   },
  { path: "/astrologer/reviews",   icon: "fa-star",           label: "Reviews"    },
];

export default function AstrologerLayout() {
  const { user }  = useAuth();
  const logout    = useLogout();
  const { data: profile } = useMyAstrologerProfileQuery();

  return (
    <div className="wrapper">

      {/* ===== NAVBAR ===== */}
      <nav className="main-header navbar navbar-expand navbar-white navbar-light border-bottom">
        <ul className="navbar-nav">
          <li className="nav-item">
            <a
              className="nav-link"
              data-lte-toggle="sidebar"
              href="#"
              role="button"
              onClick={(e) => e.preventDefault()}
            >
              <i className="fas fa-bars" />
            </a>
          </li>
        </ul>

        <ul className="navbar-nav ms-auto me-2">
          <li className="nav-item dropdown">
            <a
              className="nav-link dropdown-toggle d-flex align-items-center gap-2 py-1"
              href="#"
              data-bs-toggle="dropdown"
            >
              {profile?.profile_image ? (
                <img
                  src={profile.profile_image}
                  alt="avatar"
                  className="rounded-circle"
                  style={{ width: 30, height: 30, objectFit: "cover" }}
                />
              ) : (
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: 30, height: 30, fontSize: 13 }}
                >
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="d-none d-md-inline small fw-semibold">
                {user?.name}
              </span>
            </a>
            <ul className="dropdown-menu dropdown-menu-end shadow-sm">
              <li>
                <a className="dropdown-item" href="/astrologer/profile">
                  <i className="fas fa-user me-2 text-muted" />
                  Profile
                </a>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button
                  className="dropdown-item text-danger"
                  onClick={() => logout("/login")}
                >
                  <i className="fas fa-sign-out-alt me-2" />
                  Logout
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      {/* ===== SIDEBAR ===== */}
      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        <a href="/astrologer/dashboard" className="brand-link px-3 py-3">
          <span className="brand-text fw-bold">
            <i className="fas fa-star text-warning me-2" />
            AstroPortal
          </span>
        </a>

        <div className="sidebar">
          {/* Profile strip */}
          <div className="user-panel mt-3 pb-3 mb-3 d-flex align-items-center px-3">
            <div className="image">
              {profile?.profile_image ? (
                <img
                  src={profile.profile_image}
                  className="img-circle elevation-2"
                  alt="avatar"
                  style={{ width: 33, height: 33, objectFit: "cover" }}
                />
              ) : (
                <div
                  className="img-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: 33, height: 33, fontSize: 14 }}
                >
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="info ms-2 overflow-hidden">
              <span
                className="d-block text-white text-truncate"
                style={{ fontSize: 13 }}
              >
                {user?.name}
              </span>
              {profile && (
                <span
                  className={`badge ${
                    profile.is_online ? "bg-success" : "bg-secondary"
                  }`}
                  style={{ fontSize: 10 }}
                >
                  {profile.is_online ? "● Online" : "○ Offline"}
                </span>
              )}
            </div>
          </div>

          <nav className="mt-2">
            <ul
              className="nav nav-pills nav-sidebar flex-column"
              data-widget="treeview"
            >
              {NAV_ITEMS.map((item) => (
                <li className="nav-item" key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active" : ""}`
                    }
                  >
                    <i className={`nav-icon fas ${item.icon}`} />
                    <p>{item.label}</p>
                  </NavLink>
                </li>
              ))}

              <li className="nav-item mt-3">
                <button
                  className="nav-link text-danger border-0 bg-transparent w-100 text-start"
                  onClick={() => logout("/login")}
                >
                  <i className="nav-icon fas fa-sign-out-alt" />
                  <p>Logout</p>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* ===== CONTENT ===== */}
      <div className="content-wrapper">
        <Outlet />
      </div>

      <footer className="main-footer text-center py-2">
        <small className="text-muted">
          AstroPortal &copy; {new Date().getFullYear()}
        </small>
      </footer>
    </div>
  );
}