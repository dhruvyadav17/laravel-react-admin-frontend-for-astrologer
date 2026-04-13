import type { ReactElement } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';

export default function Can({
  permission,
  children,
}: {
  permission: string;
  children: ReactElement;
}) {
  const { can } = useAuth();
  return can(permission) ? children : null;
}
