import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import "../styles/index.css";

export default function UserLayout() {
  const { loading } = useAuth();

  /* ================= GLOBAL LOADER ================= */
  if (loading) {
    return (
      <div className="layout-loader">
        <div className="text-center">
          <div className="spinner-border text-danger mb-2" />
          <p className="text-muted small mb-0">
            Loading your experience...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-root">

      {/* ================= HEADER ================= */}
      <Header />

      {/* ================= MAIN ================= */}
      <main className="layout-main">
        <div className="container">
          <Outlet />
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <Footer />

    </div>
  );
}