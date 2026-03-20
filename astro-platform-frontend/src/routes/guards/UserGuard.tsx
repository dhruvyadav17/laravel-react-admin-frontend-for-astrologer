import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";

export default function UserGuard() {
  const { isAuth, isAdmin } = useAuth();

  // ❌ Not logged in
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Admin ko frontend se block
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // ✅ Frontend users allowed (user + astrologer)
  return <Outlet />;
}