import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import "../styles/index.css"
export default function UserLayout() {
  const { loading } = useAuth();

  /* 🔥 GLOBAL LOADER */
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-danger" />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">

      {/* HEADER */}
      <Header />

      {/* MAIN CONTENT */}
      <main className="flex-grow-1 page">
        <div className="container">
          <Outlet />
        </div>
      </main>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}