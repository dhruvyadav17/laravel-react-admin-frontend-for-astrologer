import { NavLink } from "react-router-dom";
import AdminLogoutButton from "../components/common/AdminLogoutButton";

type Props = {
  onToggle: () => void;
};

export default function AdminNavbar({ onToggle }: Props) {
  return (
    <>
      {/* LEFT */}
      <ul className="navbar-nav">
        <li className="nav-item">
          <button
            type="button"
            className="nav-link btn btn-link"
            onClick={onToggle}
          >
            <i className="fas fa-bars" />
          </button>
        </li>

        <li className="nav-item d-none d-md-inline-block">
          <NavLink to="/admin/dashboard" className="nav-link">
            Home
          </NavLink>
        </li>
      </ul>

      {/* RIGHT */}
      <ul className="navbar-nav ms-auto">
        <li className="nav-item dropdown">
          <a className="nav-link" data-bs-toggle="dropdown" href="#">
            <i className="far fa-user" />
          </a>

          <div className="dropdown-menu dropdown-menu-end">
            <NavLink to="/admin/profile" className="dropdown-item">
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
