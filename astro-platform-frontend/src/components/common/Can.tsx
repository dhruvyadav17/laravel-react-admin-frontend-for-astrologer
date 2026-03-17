import { useAuth } from "../../auth/hooks/useAuth";

export default function Can({
  permission,
  children,
}: {
  permission: string;
  children: JSX.Element;
}) {
  const { can } = useAuth();
  return can(permission) ? children : null;
}
