import AuthLayout from "../auth/layouts/AuthLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import VerifyEmail from "../pages/auth/VerifyEmail";
import HomePage from "../pages/HomePage";

import { RouteObject } from "react-router-dom";

export const authRoutes: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      { path: "/", element: <HomePage /> }, // 🔥 NEW

      { path: "/login", element: <Login /> },
      { path: "/admin/login", element: <Login admin /> },

      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },
      { path: "/verify-email", element: <VerifyEmail /> },
    ],
  },
];