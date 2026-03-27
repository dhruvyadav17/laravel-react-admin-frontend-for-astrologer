import UserLayout from "../layouts/UserLayout";
import HomePage from "../features/home/HomePage";
import ProfilePage from "../features/profile/ProfilePage";
import PanchangPage from "../pages/PanchangPage";
import AstrologersPage from "../features/astrologers/AstrologersPage";
import AstrologerDetailPage from "../features/astrologers/AstrologerDetailPage";
import UserGuard from "../../routes/guards/UserGuard";

export const userRoutes = [
  {
    path: "/",
    element: <UserLayout />,
    children: [
      { index: true, element: <HomePage /> },

      {
        element: <UserGuard />,
        children: [
          { path: "panchang", element: <PanchangPage /> },
          { path: "astrologers", element: <AstrologersPage /> },
          { path: "astrologers/:id", element: <AstrologerDetailPage /> },
          { path: "profile", element: <ProfilePage /> },

          // future ready
          { path: "booking", element: <div>Booking</div> },
          { path: "wallet", element: <div>Wallet</div> },
        ],
      },
    ],
  },
];