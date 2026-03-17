import { useEffect, useRef } from "react";
import MenuRenderer from "../components/sidebar/MenuRenderer";
import { useGetSidebarQuery } from "../../store/api";

export default function AdminSidebar() {
  const { data: groups = [] } = useGetSidebarQuery();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // 🔥 retain scroll position
  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;

    el.scrollTop = Number(localStorage.getItem("sidebar-scroll") || 0);

    const onScroll = () =>
      localStorage.setItem("sidebar-scroll", String(el.scrollTop));

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="sidebar" ref={sidebarRef}>
      {/* BRAND */}
      <a href="/admin/dashboard" className="brand-link">
        <span className="brand-text">
          <b>Admin</b>LTE 4
        </span>
      </a>

      {/* MENU */}
      <nav className="mt-2">
        <ul className="nav nav-pills nav-sidebar flex-column" role="menu">
          {groups.map((group) => (
            <MenuRenderer key={group.label} group={group} />
          ))}
        </ul>
      </nav>
    </div>
  );
}
