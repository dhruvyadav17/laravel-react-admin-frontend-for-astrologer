export function resolveLoginRedirect(user: any, loginFrom: "admin" | "user") {
  if (!user) return "/login";

  // 🔥 अगर user panel से login हुआ
  if (loginFrom === "user") {
    return "/";
  }

  // 🔥 अगर admin panel से login हुआ
  if (loginFrom === "admin") {
    if (
      user.roles?.includes("admin") ||
      user.roles?.includes("super-admin")
    ) {
      return "/admin/dashboard";
    }

    // fallback (अगर गलती से user admin से login करे)
    return "/";
  }

  return "/";
}