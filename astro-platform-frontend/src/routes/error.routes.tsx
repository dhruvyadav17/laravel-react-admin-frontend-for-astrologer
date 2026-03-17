import Unauthorized from "../pages/errors/Unauthorized";
import NotFound from "../pages/errors/NotFound";

export const errorRoutes = [
  { path: "/admin/unauthorized", element: <Unauthorized /> },
  { path: "*", element: <NotFound /> },
];
