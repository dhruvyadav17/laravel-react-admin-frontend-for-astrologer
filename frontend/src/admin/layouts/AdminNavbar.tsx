import { NavLink }          from 'react-router-dom';
import { useAuth }          from '../../auth/hooks/useAuth';
import { useTheme }         from '../../hooks/useTheme';
import AdminLogoutButton    from '../components/auth/AdminLogoutButton';
import NotificationBell     from '../../components/ui/NotificationBell';

type Props = { onToggle: () => void };

export default function AdminNavbar({ onToggle }: Props) {
  const { user }        = useAuth();
  const { isDark, toggle } = useTheme();
  const initials        = user?.name?.slice(0, 2).toUpperCase() ?? 'AD';

  return (
    <>
      {/* -- LEFT ----------------------------------- */}
      <ul className="navbar-nav align-items-center">
        <li className="nav-item">
          <button
            type="button"
            className="nav-link btn btn-link"
            onClick={onToggle}
            title="Toggle sidebar"
          >
            <i className="fas fa-bars" />
          </button>
        </li>
        <li className="nav-item d-none d-md-flex align-items-center">
          <i className="fas fa-star text-warning me-2" />
          <span className="nav-link fw-semibold mb-0">Astrology Dashboard</span>
        </li>
      </ul>

      {/* -- RIGHT ---------------------------------- */}
      <ul className="navbar-nav ms-auto align-items-center gap-1">

        {/* Dark mode toggle */}
        <li className="nav-item">
          <button
            className="nav-link btn btn-link"
            onClick={toggle}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <i className={`fas ${isDark ? 'fa-sun text-warning' : 'fa-moon'}`} />
          </button>
        </li>

        {/* Notification Bell */}
        <li className="nav-item">
          <NotificationBell pollingMs={30000} />
        </li>

        {/* User dropdown */}
        <li className="nav-item dropdown">
          <button
            className="nav-link btn btn-link d-flex align-items-center gap-2"
            data-bs-toggle="dropdown"
          >
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center
                          justify-content-center fw-bold"
              style={{ width: 30, height: 30, fontSize: 12 }}
            >
              {initials}
            </div>
            <span className="d-none d-md-inline small fw-semibold">
              {user?.name ?? 'Admin'}
            </span>
          </button>

          <div className="dropdown-menu dropdown-menu-end shadow-sm">
            {user && (
              <>
                <div className="dropdown-item-text py-2">
                  <div className="fw-semibold small">{user.name}</div>
                  <div className="text-muted" style={{ fontSize: 11 }}>{user.email}</div>
                </div>
                <div className="dropdown-divider" />
              </>
            )}

            <NavLink to="/admin/profile" className="dropdown-item">
              <i className="fas fa-user me-2 text-muted" />Profile
            </NavLink>

            <NavLink to="/admin/activity" className="dropdown-item">
              <i className="fas fa-history me-2 text-muted" />Activity Log
            </NavLink>

            <div className="dropdown-divider" />
            <AdminLogoutButton variant="dropdown" />
          </div>
        </li>
      </ul>
    </>
  );
}
