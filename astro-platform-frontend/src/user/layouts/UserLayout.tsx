import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import "../styles/index.css";

export default function UserLayout() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="layout-loader text-center">
        <div className="spinner-border text-danger mb-2" />
        <p className="text-muted small">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Header />

      <main className="container py-3">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}