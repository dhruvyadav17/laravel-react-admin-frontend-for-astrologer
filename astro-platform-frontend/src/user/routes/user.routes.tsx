import UserLayout from "../layouts/UserLayout";
import HomePage from "../features/home/HomePage";
import ProfilePage from "../features/profile/ProfilePage";
import PanchangPage from "../pages/PanchangPage";
import AstrologersPage from "../features/astrologers/AstrologersPage";

import UserGuard from "../../routes/guards/UserGuard";

export const userRoutes = [
  {
    path: "/",
    element: <UserLayout />,
    children: [
      /* ================= PUBLIC ================= */

      {
        index: true,
        element: <HomePage />, // ✅ always accessible
      },

      {
        path: "panchang",
        element: <PanchangPage />, // ✅ public
      },

      {
        path: "astrologers",
        element: <AstrologersPage />, // ✅ public browsing
      },

      /* ================= PROTECTED ================= */

      {
        path: "profile",
        element: (
          <UserGuard>
            <ProfilePage />
          </UserGuard>
        ),
      },

      /* 🔥 FUTURE READY ROUTES */

      {
        path: "booking",
        element: (
          <UserGuard>
            <div>Booking Page (Coming Soon)</div>
          </UserGuard>
        ),
      },

      {
        path: "wallet",
        element: (
          <UserGuard>
            <div>Wallet Page (Coming Soon)</div>
          </UserGuard>
        ),
      },
    ],
  },
];