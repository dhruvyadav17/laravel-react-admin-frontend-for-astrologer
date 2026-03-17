import { Navigate } from "react-router-dom";
import LoginForm from "../../auth/LoginForm";
import { useAuth } from "../../auth/hooks/useAuth";
import { resolveLoginRedirect } from "../../utils/authRedirect";

type Props = {
  admin?: boolean;
};

export default function Login({ admin = false }: Props) {
  const { isAuth, user } = useAuth();

  if (isAuth) {
    return <Navigate to={resolveLoginRedirect(user, admin)} replace />;
  }

  return <LoginForm title={admin ? "Admin Login" : "User Login"} />;
}
