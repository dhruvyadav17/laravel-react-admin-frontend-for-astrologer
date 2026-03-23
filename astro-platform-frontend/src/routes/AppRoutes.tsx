import { useRoutes, Navigate } from "react-router-dom";

import { authRoutes } from "./auth.routes";
import { adminRoutes } from "../admin/routes/admin.routes";
import { userRoutes } from "../user/routes/user.routes";
import { errorRoutes } from "./error.routes";

export default function AppRoutes() {
  return useRoutes([
    ...authRoutes,     // ✅ login routes
    ...userRoutes,     // ✅ frontend user panel
    ...adminRoutes,    // ✅ admin panel
    ...errorRoutes,    // ✅ error pages

    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ]);
}