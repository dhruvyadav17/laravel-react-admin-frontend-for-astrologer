import { Navigate }       from "react-router-dom";
import AdminGuard          from "../../routes/guards/AdminGuard";
import AdminLayout         from "../layouts/AdminLayout";
import DashboardPage       from "../features/dashboard/DashboardPage";
import UsersPage           from "../features/users/UsersPage";
import AstrologersPage     from "../features/astrologers/AstrologersPage";
import RolesPage           from "../features/roles/RolesPage";
import PermissionsPage     from "../features/permissions/PermissionsPage";
import AdminProfilePage    from "../features/profile/AdminProfilePage";

export const adminRoutes = {
  path:    "admin",
  element: <AdminGuard />,
  children: [
    {
      element:  <AdminLayout />,
      children: [
        { index: true,         element: <Navigate to="dashboard" replace /> },
        { path: "dashboard",   element: <DashboardPage /> },
        { path: "users",       element: <UsersPage /> },
        { path: "astrologers", element: <AstrologersPage /> },
        { path: "roles",       element: <RolesPage /> },
        { path: "permissions", element: <PermissionsPage /> },
        { path: "profile",     element: <AdminProfilePage /> },
        {
          path: "unauthorized",
          element: (
            <div className="content pt-3">
              <div className="container-fluid text-center py-5">
                <i className="fas fa-ban text-danger fa-4x d-block mb-3" />
                <h2>403 — Unauthorized</h2>
                <p className="text-muted">
                  You don't have permission for this page.
                </p>
                <a href="/admin/dashboard" className="btn btn-primary mt-2">
                  Back to Dashboard
                </a>
              </div>
            </div>
          ),
        },
      ],
    },
  ],
};