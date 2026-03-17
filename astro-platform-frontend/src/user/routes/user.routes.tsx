import AuthGuard from "../../guards/AuthGuard";
import UserLayout from "../layouts/UserLayout";

import ProfilePage from "../features/profile/ProfilePage";

export const userRoutes = [
  {
    element: <AuthGuard />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { path: "/profile", element: <ProfilePage /> },
        ],
      },
    ],
  },
];
