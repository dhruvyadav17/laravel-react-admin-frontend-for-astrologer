import { RouteObject, Navigate } from "react-router-dom";
import AdminGuard from "../../routes/guards/AdminGuard";
import AdminLayout from "../layouts/AdminLayout";

import DashboardPage from "../features/dashboard/DashboardPage";
import UsersPage  from "../features/users/UsersPage";

import RolesPage from "../features/roles/RolesPage";
import PermissionsPage from "../features/permissions/PermissionsPage";
import AdminProfilePage from "../features/profile/AdminProfilePage";
import AstrologersPage from "../features/astrologers/AstrologersPage";

export const adminRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: <AdminGuard />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },

          { path: "dashboard", element: <DashboardPage /> },
          { path: "profile", element: <AdminProfilePage /> },

          // 🔥 NO PERMISSION AT ROUTE LEVEL
          { path: "users", element: <UsersPage /> },
          { path: "roles", element: <RolesPage /> },
          { path: "permissions", element: <PermissionsPage /> },

          { path: "astrologers", element: <AstrologersPage /> },
        ],
      },
    ],
  },
];
