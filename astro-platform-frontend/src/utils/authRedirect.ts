export const FRONTEND_ROLES = ["user", "astrologer"];

export const isFrontendUser = (roles: string[]) => {
  if (!roles || roles.length === 0) return true;

  return roles.every((r) => FRONTEND_ROLES.includes(r));
};

export const isAdminUser = (roles: string[]) => {
  if (!roles || roles.length === 0) return false;

  return roles.some((r) => !FRONTEND_ROLES.includes(r));
};

export function resolveLoginRedirect(
  user: any,
  loginFrom: "admin" | "user"
) {
  if (!user) return "/login";

  const roles: string[] = user.roles || [];

  const frontend = isFrontendUser(roles);
  const admin = isAdminUser(roles);

  /* ================= BOTH ACCESS ================= */
  if (frontend && admin) {
    return loginFrom === "admin"
      ? "/admin/dashboard"
      : "/";
  }

  /* ================= ONLY FRONTEND ================= */
  if (frontend) return "/";

  /* ================= ONLY ADMIN ================= */
  if (admin) return "/admin/dashboard";

  return "/";
}