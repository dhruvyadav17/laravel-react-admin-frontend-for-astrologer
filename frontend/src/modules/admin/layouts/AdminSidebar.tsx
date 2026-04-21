
import { useEffect, useRef }  from "react";
import { Link }               from "react-router-dom";
import MenuRenderer            from "../components/sidebar/MenuRenderer";
import { useGetSidebarQuery }  from "../../../store/admin.api";
import { useAuth }             from "../../auth/hooks/useAuth";

export default function AdminSidebar() {
  const { data: groups = [] } = useGetSidebarQuery();
  const { user, roles }       = useAuth();
  const sidebarRef            = useRef<HTMLDivElement>(null);

  /* Retain scroll position across navigation */
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

      
      <Link to="/admin/dashboard" className="brand-link brand-link-custom">
        <i className="fas fa-star text-warning me-2" />
        <span className="brand-text fw-bold">AstroPanel</span>
      </Link>

      {/* IMPROVEMENT: User info strip */}
      {user && (
        <div className="user-panel mt-3 pb-3 mb-3 d-flex align-items-center px-3 border-bottom border-secondary">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center
                        justify-content-center fw-bold me-2 flex-shrink-0"
            style={{ width: 32, height: 32, fontSize: 13 }}
          >
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <div
              className="text-white text-truncate fw-semibold"
              style={{ fontSize: 13 }}
            >
              {user.name}
            </div>
            <div className="text-secondary text-truncate" style={{ fontSize: 11 }}>
              {roles[0] ?? "admin"}
            </div>
          </div>
        </div>
      )}

      {/* Menu */}
      <nav className="mt-2">
        <ul
          className="nav nav-pills nav-sidebar flex-column"
          role="menu"
        >
          {groups.map((group) => (
            <MenuRenderer key={group.label} group={group} />
          ))}
        </ul>
      </nav>
    </div>
  );
}
