// PATH: src/utils/authRedirect.ts  UPDATE
// CHANGE: resolveLoginRedirect mein astrologer role check add kiya
// REASON: Astrologer login karta tha toh / (home) pe redirect hota tha — wrong.
//         Ab astrologer → /astrologer/dashboard, admin → /admin/dashboard, user → /

export const FRONTEND_ROLES = ['user', 'astrologer'];

export const isFrontendUser = (roles: string[]) => {
  if (!roles || roles.length === 0) return true;
  return roles.every((r) => FRONTEND_ROLES.includes(r));
};

export const isAdminUser = (roles: string[]) => {
  if (!roles || roles.length === 0) return false;
  return roles.some((r) => !FRONTEND_ROLES.includes(r));
};

export function resolveLoginRedirect(user: any, loginFrom: 'admin' | 'user'): string {
  if (!user) return '/login';

  const roles: string[] = user.roles || [];

  // SUPER ADMIN / ADMIN / MANAGER
  if (isAdminUser(roles)) {
    return loginFrom === 'admin' ? '/admin/dashboard' : '/admin/dashboard';
  }

  // ASTROLOGER — NEW: redirect to astrologer portal
  if (roles.includes('astrologer')) {
    return '/astrologer/dashboard';
  }

  // REGULAR USER
  return '/';
}