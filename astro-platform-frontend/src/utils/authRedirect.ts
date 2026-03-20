import type { User } from "../types/models";

export function resolveLoginRedirect(
  user: User | null,
  fromAdminLogin: boolean = false
): string {
  /* ❌ No user */
  if (!user) return "/";

  const roles = Array.isArray(user.roles) ? user.roles : [];

  const isAdmin = roles.some((r) =>
    ["admin", "super-admin", "manager"].includes(r)
  );

  const isFrontendUser =
    roles.length === 0 ||
    roles.includes("user") ||
    roles.includes("astrologer");

  /* ================= ADMIN LOGIN ================= */
  if (fromAdminLogin) {
    return isAdmin
      ? "/admin/dashboard"
      : "/"; // 🔥 fallback to welcome
  }

  /* ================= FRONTEND LOGIN ================= */
  return isFrontendUser
    ? "/home" // 🔥 IMPORTANT CHANGE
    : "/admin/dashboard";
}