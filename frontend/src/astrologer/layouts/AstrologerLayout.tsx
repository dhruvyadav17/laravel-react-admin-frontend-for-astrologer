// PATH: src/astrologer/layouts/AstrologerLayout.tsx
// IMPROVED: NotificationBell add kiya in navbar
// IMPROVED: Dark mode toggle
// IMPROVED: Online/Offline toggle button in sidebar (quick toggle)

import { NavLink, Link, Outlet }       from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import 'admin-lte/dist/css/adminlte.min.css';
import { useAuth }                     from '../../auth/hooks/useAuth';
import { useLogout }                   from '../../auth/hooks/useLogout';
import { useTheme }                    from '../../hooks/useTheme';
import { useMyAstrologerProfileQuery,
         useToggleAvailabilityMutation } from '../../store/api/astrologer.api';
import Avatar                          from '../../components/ui/Avatar';
import NotificationBell                from '../../components/ui/NotificationBell';
import { toast }                       from 'react-toastify';

const NAV_ITEMS = [
  { path: '/astrologer/dashboard',     icon: 'fa-tachometer-alt', label: 'Dashboard'     },
  { path: '/astrologer/consultations', icon: 'fa-phone',          label: 'Consultations' },
  { path: '/astrologer/profile',       icon: 'fa-user-edit',      label: 'My Profile'    },
  { path: '/astrologer/schedule',      icon: 'fa-calendar-alt',   label: 'Schedule'      },
  { path: '/astrologer/reviews',       icon: 'fa-star',           label: 'Reviews'       },
  { path: '/astrologer/earnings',      icon: 'fa-rupee-sign',     label: 'Earnings'      },
];

export default function AstrologerLayout() {
  const { user }               = useAuth();
  const logout                 = useLogout();
  const { isDark, toggle: toggleTheme } = useTheme();
  const { data: profile }      = useMyAstrologerProfileQuery();
  const [toggleAvail, { isLoading: toggling }] = useToggleAvailabilityMutation();
  const sidebarRef             = useRef<HTMLElement | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => { import('admin-lte/dist/js/adminlte.min.js'); }, []);

  useEffect(() => {
    document.body.classList.toggle('sidebar-collapse', collapsed);
    document.body.classList.toggle('sidebar-open',    !collapsed);
    return () => {
      document.body.classList.remove('sidebar-collapse', 'sidebar-open');
    };
  }, [collapsed]);

  const handleToggleAvailability = async () => {
    try {
      const res = await toggleAvail().unwrap();
      toast.success(res.is_online ? 'You are now Online ✅' : 'You are now Offline');
    } catch {
      toast.error('Could not update availability');
    }
  };

  return (
    <div className="app-wrapper layout-fixed">

      {/* ── Navbar ───────────────────────────────── */}
      <nav className="app-header navbar navbar-expand bg-body border-bottom">
        <ul className="navbar-nav align-items-center">
          <li className="nav-item">
            <button type="button" className="nav-link btn btn-link"
              onClick={() => setCollapsed(v => !v)}>
              <i className="fas fa-bars" />
            </button>
          </li>
          <li className="nav-item d-none d-md-flex align-items-center ms-2">
            <i className="fas fa-star text-warning me-2" />
            <span className="fw-semibold">AstroPortal</span>
          </li>
        </ul>

        <ul className="navbar-nav ms-auto align-items-center gap-1 me-2">

          {/* Dark mode */}
          <li className="nav-item">
            <button className="nav-link btn btn-link" onClick={toggleTheme}
              title={isDark ? 'Light Mode' : 'Dark Mode'}>
              <i className={`fas ${isDark ? 'fa-sun text-warning' : 'fa-moon'}`} />
            </button>
          </li>

          {/* Notifications */}
          <li className="nav-item">
            <NotificationBell pollingMs={20000} />
          </li>

          {/* User dropdown */}
          <li className="nav-item dropdown">
            <button className="nav-link btn btn-link dropdown-toggle d-flex align-items-center gap-2"
              data-bs-toggle="dropdown">
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
                <button className="dropdown-item text-danger"
                  onClick={() => logout('/login')}>
                  <i className="fas fa-sign-out-alt me-2" />Logout
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      {/* ── Sidebar ──────────────────────────────── */}
      <aside className="app-sidebar shadow" ref={sidebarRef}>
        <div className="sidebar-brand">
          <Link to="/astrologer/dashboard" className="brand-link">
            <i className="fas fa-star text-warning me-2" />
            <span className="brand-text fw-bold">AstroPortal</span>
          </Link>
        </div>

        <div className="sidebar overflow-auto">
          {/* User strip */}
          <div className="d-flex align-items-center gap-2 px-3 py-3 border-bottom border-secondary">
            <Avatar name={user?.name} src={profile?.profile_image} size={36} />
            <div className="overflow-hidden flex-grow-1">
              <div className="text-white fw-semibold text-truncate" style={{ fontSize: 13 }}>
                {user?.name}
              </div>
              {/* Online toggle button */}
              <button
                className={`badge border-0 ${profile?.is_online ? 'bg-success' : 'bg-secondary'}`}
                style={{ fontSize: 10, cursor: 'pointer' }}
                onClick={handleToggleAvailability}
                disabled={toggling}
                title="Click to toggle online/offline"
              >
                {toggling
                  ? <span className="spinner-border spinner-border-sm" style={{ width: 8, height: 8 }} />
                  : profile?.is_online ? '● Online' : '○ Offline'
                }
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav className="mt-2 px-2">
            <ul className="nav nav-pills nav-sidebar flex-column">
              {NAV_ITEMS.map(item => (
                <li className="nav-item" key={item.path}>
                  <NavLink to={item.path}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <i className={`nav-icon fas ${item.icon}`} />
                    <p className="mb-0">{item.label}</p>
                  </NavLink>
                </li>
              ))}
              <li className="nav-item mt-2 border-top border-secondary pt-2">
                <button
                  className="nav-link text-danger border-0 bg-transparent w-100 text-start"
                  onClick={() => logout('/login')}>
                  <i className="nav-icon fas fa-sign-out-alt" />
                  <p className="mb-0">Logout</p>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────── */}
      <main className="app-main">
        <div className="app-content">
          <div className="container-fluid py-3">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
