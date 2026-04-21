import { Navigate, Outlet }  from "react-router-dom";
import AuthLayout             from './layouts/AuthLayout';
import Login                  from './pages/Login';
import Register               from './pages/Register';
import ForgotPassword         from './pages/ForgotPassword';
import ResetPassword          from './pages/ResetPassword';
import VerifyEmail            from './pages/VerifyEmail';

export const authRoutes = {
  element: <AuthLayout />,
  children: [
    { path: "login",                   element: <Login /> },
    { path: "admin/login",             element: <Login admin /> },
    { path: "register",                element: <Register /> },
    { path: "forgot-password",         element: <ForgotPassword /> },
    { path: "reset-password",          element: <ResetPassword /> },
    { path: "verify-email",            element: <VerifyEmail /> },
  ],
};