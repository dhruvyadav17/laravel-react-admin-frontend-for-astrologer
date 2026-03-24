import UserLayout from "../layouts/UserLayout";
import HomePage from "../features/home/HomePage";
import ProfilePage from "../features/profile/ProfilePage";
import PanchangPage from "../pages/PanchangPage";
import AstrologersPage from "../features/astrologers/AstrologersPage";

import UserGuard from "../../routes/guards/UserGuard";
import AstrologerDetailPage from "../features/astrologers/AstrologerDetailPage";

export const userRoutes = [
  {
    path: "/",
    element: <UserLayout />,
    children: [
      /* ================= PUBLIC ================= */

      { index: true, element: <HomePage /> },

      { path: "panchang", element: <PanchangPage /> },

      {
        path: "astrologers",
        element: <AstrologersPage />,
      },
      {
        path: "astrologers/:id",
        element: <AstrologerDetailPage />,
      },

      /* ================= PROTECTED ================= */

      {
        element: <UserGuard />, // 🔥 ONE PLACE GUARD
        children: [
          { path: "profile", element: <ProfilePage /> },

          // 🔥 future ready
          { path: "booking", element: <div>Booking Page</div> },
          { path: "wallet", element: <div>Wallet Page</div> },
        ],
      },
    ],
  },
];