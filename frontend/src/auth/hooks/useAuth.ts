/**
 * useAuth -- reads the current user from the Redux auth slice.
 *
 * Returns:
 *   user         -- full User object or null
 *   isAuth       -- logged in?
 *   isAdmin      -- has admin or super-admin role?
 *   isAstrologer -- has astrologer role?
 *   token        -- Sanctum Bearer token (for manual fetch() calls)
 *
 * Does NOT perform any network requests. The auth state is populated by
 * LoginForm -> loginThunk -> authSlice.ts.
 */
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

export function useAuth() {
  const user        = useSelector((s: RootState) => s.auth.user);
  const permissions = useSelector((s: RootState) => s.auth.permissions);
  const token       = useSelector((s: RootState) => s.auth.token);
  const loading     = useSelector((s: RootState) => s.auth.loading);

  const roles: string[] = user?.roles ?? [];
  const isAuth          = Boolean(user);

  const isAstrologer = isAuth && roles.includes('astrologer');
  const isAdmin      = isAuth && roles.some((r) => !['user', 'astrologer'].includes(r));
  const isSuperAdmin = roles.includes('super-admin');
  const isFrontendUser =
    isAuth &&
    (roles.length === 0 || roles.every((r) => ['user', 'astrologer'].includes(r)));

  const hasRole    = (role: string): boolean   => isSuperAdmin || roles.includes(role);
  const hasAnyRole = (list: string[]): boolean => isSuperAdmin || list.some((r) => roles.includes(r));
  const can        = (permission: string): boolean => isSuperAdmin || permissions.includes(permission);
  const canAny     = (perms: string[]): boolean    => isSuperAdmin || perms.some((p) => permissions.includes(p));

  return {
    user, roles, permissions, token, loading,
    isAuth, isAdmin, isAstrologer, isFrontendUser, isSuperAdmin,
    hasRole, hasAnyRole, can, canAny,
  };
}
