// PATH: src/astrologer/layouts/AstrologerLayout.tsx
// REFACTOR: Avatar component use kiya — 2 jagah repeated block tha (navbar + sidebar)

import { NavLink, Link, Outlet }       from "react-router-dom";
import { useAuth }                     from "../../auth/hooks/useAuth";
import { useLogout }                   from "../../auth/hooks/useLogout";
import { useMyAstrologerProfileQuery } from "../../store/api/astrologer.api";
import Avatar                          from "../../components/ui/Avatar";

const NAV_ITEMS = [
  { path: "/astrologer/dashboard",     icon: "fa-tachometer-alt", label: "Dashboard"     },
  { path: "/astrologer/consultations", icon: "fa-phone",          label: "Consultations" },
  { path: "/astrologer/profile",       icon: "fa-user-edit",      label: "My Profile"    },
  { path: "/astrologer/schedule",      icon: "fa-calendar-alt",   label: "Schedule"      },
  { path: "/astrologer/reviews",       icon: "fa-star",           label: "Reviews"       },
  { path: "/astrologer/earnings",      icon: "fa-rupee-sign",     label: "Earnings"      },
];

export default function AstrologerLayout() {
  const { user }          = useAuth();
  const logout            = useLogout();
  const { data: profile } = useMyAstrologerProfileQuery();

  return (
    <div className="wrapper">

      {/* Navbar */}
      <nav className="main-header navbar navbar-expand navbar-white navbar-light border-bottom">
        <ul className="navbar-nav">
          <li className="nav-item">
            <button className="nav-link btn btn-link" data-lte-toggle="sidebar"
              onClick={(e) => e.preventDefault()}>
              <i className="fas fa-bars" />
            </button>
          </li>
        </ul>
        <ul className="navbar-nav ms-auto me-2">
          <li className="nav-item dropdown">
            <button className="nav-link btn btn-link dropdown-toggle d-flex align-items-center gap-2 py-1"
              data-bs-toggle="dropdown">
              {/* BEFORE: 8-line if/else block | AFTER: 1 line */}
              <Avatar name={user?.name} src={profile?.profile_image} size={30} />
              <span className="d-none d-md-inline small fw-semibold">{user?.name}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow-sm">
              <li>
                <Link className="dropdown-item" to="/astrologer/profile">
                  <i className="fas fa-user me-2 text-muted" />Profile
                </Link>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item text-danger" onClick={() => logout("/login")}>
                  <i className="fas fa-sign-out-alt me-2" />Logout
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      {/* Sidebar */}
      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        <Link to="/astrologer/dashboard" className="brand-link px-3 py-3">
          <span className="brand-text fw-bold">
            <i className="fas fa-star text-warning me-2" />AstroPortal
          </span>
        </Link>
        <div className="sidebar">
          {/* User strip — BEFORE: 8-line block | AFTER: Avatar */}
          <div className="user-panel mt-3 pb-3 mb-3 d-flex align-items-center px-3">
            <div className="image">
              <Avatar name={user?.name} src={profile?.profile_image} size={33} />
            </div>
            <div className="info ms-2 overflow-hidden">
              <span className="d-block text-white text-truncate" style={{ fontSize: 13 }}>
                {user?.name}
              </span>
              {profile && (
                <span className={`badge ${profile.is_online ? "bg-success" : "bg-secondary"}`}
                  style={{ fontSize: 10 }}>
                  {profile.is_online ? "● Online" : "○ Offline"}
                </span>
              )}
            </div>
          </div>
          <nav className="mt-2">
            <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview">
              {NAV_ITEMS.map((item) => (
                <li className="nav-item" key={item.path}>
                  <NavLink to={item.path}
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                    <i className={`nav-icon fas ${item.icon}`} />
                    <p>{item.label}</p>
                  </NavLink>
                </li>
              ))}
              <li className="nav-item mt-3">
                <button className="nav-link text-danger border-0 bg-transparent w-100 text-start"
                  onClick={() => logout("/login")}>
                  <i className="nav-icon fas fa-sign-out-alt" /><p>Logout</p>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      <div className="content-wrapper"><Outlet /></div>
      <footer className="main-footer text-center py-2">
        <small className="text-muted">AstroPortal &copy; {new Date().getFullYear()}</small>
      </footer>
    </div>
  );
}