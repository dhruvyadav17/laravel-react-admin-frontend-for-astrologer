// PATH: src/routes/auth.routes.tsx
// FIX BUG-10: /verify-email route missing tha — RegisterForm wahan navigate karta tha → 404
//             VerifyEmail page exist karta hai lekin route register nahi tha
// NOTE: email verification link bhi direct /email/verify/?id=&hash= format mein hoti hai
//       isliye VerifyEmail ko auth routes mein add kiya

import { Outlet }       from "react-router-dom";
import AuthLayout        from "../auth/layouts/AuthLayout";
import Login             from "../pages/auth/Login";
import Register          from "../pages/auth/Register";
import ForgotPassword    from "../pages/auth/ForgotPassword";
import ResetPassword     from "../pages/auth/ResetPassword";
import VerifyEmail       from "../pages/auth/VerifyEmail";  // FIX BUG-10: import add kiya

export const authRoutes = {
  element: <AuthLayout />,
  children: [
    { path: "login",          element: <Login />          },
    { path: "admin/login",    element: <Login admin />    },
    { path: "register",       element: <Register />       },
    { path: "forgot-password",element: <ForgotPassword /> },
    { path: "reset-password", element: <ResetPassword />  },
    { path: "verify-email",   element: <VerifyEmail />    },  // FIX BUG-10: route add kiya
  ],
};
