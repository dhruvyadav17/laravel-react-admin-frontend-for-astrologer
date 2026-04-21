// Reads auth state from Redux — no network calls.
// Components should use this instead of selecting from the store directly.
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';

const FRONTEND_ROLES = ['user', 'astrologer'];

export function useAuth() {
  const user        = useSelector((s: RootState) => s.auth.user);
  const permissions = useSelector((s: RootState) => s.auth.permissions);
  const token       = useSelector((s: RootState) => s.auth.token);
  const loading     = useSelector((s: RootState) => s.auth.loading);

  const roles        = user?.roles ?? [];
  const isAuth       = Boolean(user);
  const isSuperAdmin = roles.includes('super-admin');
  const isAdmin      = isAuth && roles.some(r => !FRONTEND_ROLES.includes(r));
  const isAstrologer = isAuth && roles.includes('astrologer');

  // isSuperAdmin bypasses all role/permission checks
  const hasRole = (role: string)  => isSuperAdmin || roles.includes(role);
  const can     = (perm: string)  => isSuperAdmin || permissions.includes(perm);

  return {
    user, roles, permissions, token, loading,
    isAuth, isAdmin, isAstrologer, isSuperAdmin,
    hasRole, can,
  };
}
