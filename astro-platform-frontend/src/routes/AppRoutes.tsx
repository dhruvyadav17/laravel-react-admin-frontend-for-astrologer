import { useRoutes, Navigate } from "react-router-dom";

import { authRoutes } from "./auth.routes";
import { adminRoutes } from "../admin/routes/admin.routes";
import { userRoutes } from "../user/routes/user.routes";
import { errorRoutes } from "./error.routes";

import WelcomePage from "../user/features/home/WelcomePage";

export default function AppRoutes() {
  const routes = useRoutes([
    {
      path: "/",
      element: <WelcomePage />, // 🔥 DEFAULT ENTRY
    },

    ...authRoutes,
    ...userRoutes,
    ...adminRoutes,
    ...errorRoutes,

    {
      path: "*",
      element: <Navigate to="/" />,
    },
  ]);

  return routes;
}