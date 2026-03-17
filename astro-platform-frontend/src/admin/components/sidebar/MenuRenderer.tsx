import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import type { SidebarGroup } from "../../types/sidebar";
import AdminLogoutButton from "../common/AdminLogoutButton";

type Props = {
  group: SidebarGroup;
};

export default function MenuRenderer({ group }: Props) {
  const location = useLocation();
  const items = group.children ?? [];
  if (!items.length) return null;

  // 🔥 robust active detection
  const isGroupActive = items.some(
    i =>
      i.path &&
      location.pathname.startsWith(
        i.path.replace(/\/$/, "")
      )
  );

  const [open, setOpen] = useState(isGroupActive);

  useEffect(() => {
    setOpen(isGroupActive);
  }, [location.pathname]);

  return (
    <li className={`nav-item ${open ? "menu-open" : ""}`}>
      {/* GROUP */}
      <a
        href="#"
        title={group.label} // 🔥 tooltip
        className={`nav-link ${isGroupActive ? "active" : ""}`}
        onClick={e => {
          e.preventDefault();
          setOpen(v => !v);
        }}
      >
        <i className={`nav-icon ${group.icon}`} />
        <p>
          {group.label}
          <i className="right fas fa-angle-left" />
        </p>
      </a>

      {/* CHILDREN */}
      <ul className="nav nav-treeview">
        {items.map(item => {
          if (item.action === "logout") {
            return (
              <li key={item.label} className="nav-item">
                <AdminLogoutButton variant="sidebar" />
              </li>
            );
          }

          return (
            <li key={item.label} className="nav-item">
              <NavLink
                to={item.path!}
                title={item.label} // 🔥 tooltip
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <i className="far fa-circle nav-icon" />
                <p>{item.label}</p>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </li>
  );
}
