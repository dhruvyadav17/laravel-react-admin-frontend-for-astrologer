export function resolveLoginRedirect(
  user: any,
  loginFrom: "admin" | "user"
) {
  if (!user) return "/login";

  const roles = user.roles || [];

  const isAdmin =
    roles.includes("admin") || roles.includes("super-admin");

  /* ================= FRONTEND LOGIN ================= */
  if (loginFrom === "user") {
    return "/";
  }

  /* ================= ADMIN LOGIN ================= */
  if (loginFrom === "admin") {
    if (isAdmin) return "/admin/dashboard";

    return "/";
  }

  return "/";
}