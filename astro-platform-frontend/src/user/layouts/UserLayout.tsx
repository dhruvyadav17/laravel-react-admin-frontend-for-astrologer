import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

export default function UserLayout() {
  return (
    <>
      <Header />

      <main className="min-vh-100">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}