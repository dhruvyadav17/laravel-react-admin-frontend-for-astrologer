import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";

import AstrologerLayout from "../layouts/AstrologerLayout";
import DashboardPage    from "../features/dashboard/DashboardPage";
import ProfilePage      from "../features/profile/ProfilePage";
import SchedulePage     from "../features/schedule/SchedulePage";
import MyReviewsPage    from "../features/reviews/MyReviewsPage";

/* =====================================================
 | GUARD — only role:astrologer
 ===================================================== */
function AstrologerGuard() {
  const { isAuth, hasRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!isAuth)               return <Navigate to="/login"        replace />;
  if (!hasRole("astrologer")) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
}

/* =====================================================
 | ROUTES
 ===================================================== */
export const astrologerRoutes = {
  path:    "astrologer",
  element: <AstrologerGuard />,
  children: [
    {
      element: <AstrologerLayout />,
      children: [
        { index: true,          element: <Navigate to="dashboard" replace /> },
        { path: "dashboard",    element: <DashboardPage /> },
        { path: "profile",      element: <ProfilePage /> },
        { path: "schedule",     element: <SchedulePage /> },
        { path: "reviews",      element: <MyReviewsPage /> },
      ],
    },
  ],
};