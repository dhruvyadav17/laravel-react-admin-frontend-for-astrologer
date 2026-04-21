// Resolves the correct post-login redirect URL based on user role.
// Admin/Manager → /admin/dashboard, Astrologer → /astrologer/dashboard, User → /

const FRONTEND_ROLES = ['user', 'astrologer'];

export const isAdminUser     = (roles: string[]) => roles.some(r => !FRONTEND_ROLES.includes(r));

export function resolveLoginRedirect(user: { roles?: string[] } | null): string {
  if (!user) return '/login';
  const roles = user.roles ?? [];

  if (isAdminUser(roles))         return '/admin/dashboard';
  if (roles.includes('astrologer')) return '/astrologer/dashboard';
  return '/';
}
