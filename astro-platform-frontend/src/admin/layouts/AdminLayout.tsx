import { Outlet } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "admin-lte/dist/css/adminlte.min.css";

import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  useEffect(() => {
    import("admin-lte/dist/js/adminlte.min.js");
  }, []);

  const [collapsed, setCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLElement | null>(null);

  /* ================= SIDEBAR CLASS ================= */

  useEffect(() => {
    document.body.classList.toggle(
      "sidebar-collapse",
      collapsed
    );
    document.body.classList.toggle(
      "sidebar-open",
      !collapsed
    );

    return () => {
      document.body.classList.remove(
        "sidebar-collapse",
        "sidebar-open"
      );
    };
  }, [collapsed]);

  /* ================= MOBILE OUTSIDE CLICK ================= */

  useEffect(() => {
    const isMobile =
      window.innerWidth < 992;

    if (!collapsed || !isMobile) return;

    const handler = (e: MouseEvent) => {
      const sidebar = sidebarRef.current;
      const toggleBtn =
        document.querySelector(".sidebar-toggle");

      if (
        sidebar &&
        sidebar.contains(e.target as Node)
      )
        return;

      if (
        toggleBtn &&
        toggleBtn.contains(e.target as Node)
      )
        return;

      setCollapsed(false);
    };

    document.addEventListener(
      "click",
      handler
    );

    return () =>
      document.removeEventListener(
        "click",
        handler
      );
  }, [collapsed]);

  return (
    <div className="app-wrapper layout-fixed">
      {/* HEADER */}
      <nav className="app-header navbar navbar-expand bg-body border-bottom">
        <AdminNavbar
          onToggle={() =>
            setCollapsed((v) => !v)
          }
        />
      </nav>

      {/* SIDEBAR */}
      <aside
        className="app-sidebar shadow"
        ref={sidebarRef}
      >
        <AdminSidebar />
      </aside>

      {/* MAIN */}
      <main className="app-main">
        <div className="container-fluid py-3">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
