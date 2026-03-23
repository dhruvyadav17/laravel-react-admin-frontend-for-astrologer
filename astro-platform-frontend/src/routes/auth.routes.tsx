import AuthLayout from "../auth/layouts/AuthLayout";
import LoginForm from "../auth/LoginForm";

export const authRoutes = [
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <LoginForm title="User Login" />,
      },
      {
        path: "/admin/login",
        element: <LoginForm title="Admin Login" />,
      },
      
    ],
  },
];