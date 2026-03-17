import { useRoutes } from "react-router-dom";

import { authRoutes } from "./auth.routes";
import { adminRoutes } from "../admin/routes/admin.routes";
import { userRoutes } from "../user/routes/user.routes";
import { errorRoutes } from "./error.routes";

export default function AppRoutes() {
  const routes = useRoutes([
    ...authRoutes,
    ...userRoutes,
    ...adminRoutes,
    ...errorRoutes,
  ]);

  return routes;
}
