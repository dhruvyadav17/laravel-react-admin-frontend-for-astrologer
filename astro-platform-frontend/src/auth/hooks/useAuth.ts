import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { ADMIN_ROLES } from "../../constants/rbac";

export function useAuth() {
  const user = useSelector((s: RootState) => s.auth.user);
  const permissions = useSelector((s: RootState) => s.auth.permissions);

  const roles: string[] = user?.roles ?? [];

  const isAuth = Boolean(user);

  const isSuperAdmin = roles.includes("super-admin");

  const isAdmin =
    isSuperAdmin ||
    roles.some((r) => ADMIN_ROLES.includes(r as any));

  const hasRole = (role: string): boolean =>
    isSuperAdmin || roles.includes(role);

  const hasAnyRole = (checkRoles: string[]): boolean =>
    isSuperAdmin || checkRoles.some((r) => roles.includes(r));

  const can = (permission: string): boolean =>
    isSuperAdmin || permissions.includes(permission);

  const canAny = (perms: string[]): boolean =>
    isSuperAdmin || perms.some((p) => permissions.includes(p));

  return {
    user,
    roles,
    permissions,

    isAuth,
    isAdmin,
    isSuperAdmin,

    hasRole,
    hasAnyRole,
    can,
    canAny,
  };
}
