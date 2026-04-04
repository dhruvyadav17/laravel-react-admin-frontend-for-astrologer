// =====================================================
// PATH: src/routes/AppRoutes.tsx
// =====================================================
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { adminRoutes }      from "../admin/routes/admin.routes";
import { authRoutes }       from "./auth.routes";
import { userRoutes }       from "../user/routes/user.routes";
import { astrologerRoutes } from "../astrologer/routes/astrologer.routes";
import { errorRoutes }      from "./error.routes";

const router = createBrowserRouter([
  authRoutes,
  userRoutes,
  astrologerRoutes,
  adminRoutes,
  errorRoutes,
  { path: "*", element: <Navigate to="/404" replace /> },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}