import UserLayout from "../layouts/UserLayout";
import HomePage from "../pages/HomePage";
import ProfilePage from "../features/profile/ProfilePage";
import PanchangPage from "../pages/PanchangPage";
import AstrologersPage from "../pages/AstrologersPage";
export const userRoutes = [
  {
    path: "/",
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: <HomePage />, // ✅ dashboard
      },
       {
        path: "profile",
        element: <ProfilePage />,
      },
            {
        path: "panchang",
        element: <PanchangPage />,
      },
      {
        path: "astrologers",
        element: <AstrologersPage />,
      },
    ],
  },
];