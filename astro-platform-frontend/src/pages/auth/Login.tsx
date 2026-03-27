import { Navigate, useLocation, useNavigate } from "react-router-dom";

import LoginForm from "../../auth/LoginForm";
import { useAuth } from "../../auth/hooks/useAuth";
import { resolveLoginRedirect } from "../../utils/authRedirect";
import Loader from "@/components/ui/Loader";

type Props = {
  admin?: boolean;
};

export default function Login({ admin = false }: Props) {
  const { isAuth, user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from?.pathname;

  if (loading) return <Loader />;

  if (isAuth) {
    return (
      <Navigate
        to={
          from && !admin
            ? from
            : resolveLoginRedirect(user, admin ? "admin" : "user")
        }
        replace
      />
    );
  }

  return (
    <LoginForm
      title={admin ? "Admin Login" : "User Login"}
      onSuccess={(userData: any) => {
        const redirectTo =
          from && !admin
            ? from
            : resolveLoginRedirect(userData, admin ? "admin" : "user");

        navigate(redirectTo, { replace: true });
      }}
    />
  );
}