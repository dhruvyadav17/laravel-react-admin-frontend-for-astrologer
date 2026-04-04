import { Navigate }          from "react-router-dom";
import UserLayout             from "../layouts/UserLayout";
import UserGuard              from "../../routes/guards/UserGuard";
import WelcomePage            from "../features/home/WelcomePage";
import HomePage               from "../features/home/HomePage";
import AstrologersPage        from "../features/astrologers/AstrologersPage";
import AstrologerDetailPage   from "../features/astrologers/AstrologerDetailPage";
import ProfilePage            from "../features/profile/ProfilePage";
import PanchangPage           from "../pages/PanchangPage";

export const userRoutes = {
  path:    "/",
  element: <UserLayout />,
  children: [
    { index: true,             element: <WelcomePage /> },
    { path: "home",            element: <HomePage /> },
    { path: "astrologers",     element: <AstrologersPage /> },
    { path: "astrologers/:id", element: <AstrologerDetailPage /> },
    { path: "panchang",        element: <PanchangPage /> },
    {
      path:    "profile",
      element: <UserGuard />,
      children: [{ index: true, element: <ProfilePage /> }],
    },
    {
      path: "unauthorized",
      element: (
        <div className="container py-5 text-center">
          <i className="fas fa-ban text-danger fa-4x d-block mb-3" />
          <h2>403 — Unauthorized</h2>
          <p className="text-muted">
            You don't have permission to view this page.
          </p>
          <a href="/" className="btn btn-primary mt-2">
            Go Home
          </a>
        </div>
      ),
    },
  ],
};