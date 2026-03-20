export const resolveLoginRedirect = (user: any) => {
  const roles = user?.roles || [];

  const isAdmin =
    roles.includes("super-admin") ||
    roles.includes("admin") ||
    roles.includes("manager");

  if (isAdmin) {
    return "/admin/dashboard";
  }

  return "/";
};