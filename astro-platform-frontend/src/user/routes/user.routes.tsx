import UserLayout from "../layouts/UserLayout";
import HomePage from "../features/home/HomePage";
import ProfilePage from "../features/profile/ProfilePage";
import PanchangPage from "../pages/PanchangPage";
import AstrologersPage from "../features/astrologers/AstrologersPage";
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