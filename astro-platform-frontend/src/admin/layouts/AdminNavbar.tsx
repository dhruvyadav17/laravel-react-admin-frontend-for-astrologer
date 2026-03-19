import { NavLink } from "react-router-dom";
import AdminLogoutButton from "../components/common/AdminLogoutButton";

type Props = {
  onToggle: () => void;
};

export default function AdminNavbar({ onToggle }: Props) {
  return (
    <>
      {/* LEFT */}
      <ul className="navbar-nav align-items-center">
        <li className="nav-item">
          <button
            type="button"
            className="nav-link btn btn-link"
            onClick={onToggle}
          >
            <i className="fas fa-bars" />
          </button>
        </li>

        {/* 🔮 Title */}
        <li className="nav-item d-none d-md-flex align-items-center">
          <i className="fas fa-star text-warning me-2" />

          <span className="nav-link fw-semibold mb-0">
            Astrology Dashboard
          </span>
        </li>
      </ul>

      {/* RIGHT */}
      <ul className="navbar-nav ms-auto align-items-center">
        <li className="nav-item dropdown">
          <button
            className="nav-link btn btn-link"
            data-bs-toggle="dropdown"
          >
            <i className="far fa-user" />
          </button>

          <div className="dropdown-menu dropdown-menu-end">
            <NavLink to="/admin/profile" className="dropdown-item">
              <i className="fas fa-user me-2" />
              Profile
            </NavLink>

            <div className="dropdown-divider" />

            <AdminLogoutButton variant="dropdown" />
          </div>
        </li>
      </ul>
    </>
  );
}