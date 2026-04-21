import Header from "../components/Header";
import SupportWidget from '../components/SupportWidget';
import { useLang } from '../../../i18n/useLang';
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
// user-theme CSS is loaded globally in main.tsx

export default function UserLayout() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="layout-loader text-center">
        <div className="spinner-border text-danger mb-2" />
        <p className="t-muted small">Loading...</p>
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