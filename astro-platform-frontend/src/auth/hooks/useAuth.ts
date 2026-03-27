import { useSelector } from "react-redux";
import { RootState } from "../../store";

export function useAuth() {
  const user = useSelector((s: RootState) => s.auth.user);
  const permissions = useSelector((s: RootState) => s.auth.permissions);
  const loading = useSelector((s: RootState) => s.auth.loading);

  const roles: string[] = user?.roles ?? [];

  const isAuth = Boolean(user);

  /* ================= ROLE TYPES ================= */

  const isFrontendUser =
    isAuth &&
    (roles.length === 0 ||
      roles.every((r) => ["user", "astrologer"].includes(r)));

  const isAdmin =
    isAuth &&
    roles.some((r) => !["user", "astrologer"].includes(r));

  const isSuperAdmin = roles.includes("super-admin");

  /* ================= HELPERS ================= */

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
    isFrontendUser,
    isSuperAdmin,

    hasRole,
    hasAnyRole,
    can,
    canAny,
    loading,
  };
}