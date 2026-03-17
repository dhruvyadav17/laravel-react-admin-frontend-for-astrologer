import type { User } from "../types/models";

/**
 * FINAL RULE:
 * - [] or ["user"]        → Frontend User (/profile)
 * - anything else         → Admin Panel (/admin/dashboard)
 */
export function resolveLoginRedirect(
  user: User | null,
  fromAdminLogin: boolean = false
): string {
  if (!user) return "/login";

  const roles = Array.isArray(user.roles) ? user.roles : [];

  const isFrontendUser =
    roles.length === 0 || roles.every((r) => r === "user");

  return isFrontendUser
    ? "/profile"
    : "/admin/dashboard";
}
