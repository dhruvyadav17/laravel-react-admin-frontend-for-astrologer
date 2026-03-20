import UserGuard from "../../routes/guards/UserGuard";
import UserLayout from "../layouts/UserLayout";

import ProfilePage from "../features/profile/ProfilePage";
import HomePage from "../features/home/HomePage";
import AstrologerDetailPage from "../features/astrologers/AstrologerDetailPage";

export const userRoutes = [
  {
    element: <UserGuard />,
    children: [
      {
        element: <UserLayout />,
        children: [
          /* ================= HOME ================= */
          { path: "/home", element: <HomePage /> },

          /* ================= PROFILE ================= */
          { path: "/profile", element: <ProfilePage /> },

          /* ================= ASTRO DETAIL ================= */
          { path: "/astrologers/:id", element: <AstrologerDetailPage /> },
        ],
      },
    ],
  },
];