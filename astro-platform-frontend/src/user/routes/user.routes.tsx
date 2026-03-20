import UserGuard from "../../routes/guards/UserGuard";
import UserLayout from "../layouts/UserLayout";

import ProfilePage from "../features/profile/ProfilePage";

export const userRoutes = [
  {
    element: <UserGuard />, // 🔥 UPDATED
    children: [
      {
        element: <UserLayout />,
        children: [
          { path: "/", element: <ProfilePage /> }, // 🔥 default home
          { path: "/profile", element: <ProfilePage /> },
        ],
      },
    ],
  },
];