// PATH: src/features/admin/permissions/PermissionsPage.tsx
// FIX: mutations format aligned with new AdminCrudPage API

import AdminCrudPage  from '../../../admin/components/crud/AdminCrudPage';
import RowActions      from '../../../components/table/RowActions';

import {
  useGetPermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} from '../../../store/api';

import { PERMISSIONS } from '../../../constants/rbac';
import { useAuth }     from '../../../auth/hooks/useAuth';
import type { Permission } from '../../../types/models';

export default function PermissionsPage() {
  const { can } = useAuth();

  const query             = useGetPermissionsQuery();
  const [createPerm]      = useCreatePermissionMutation();
  const [updatePerm]      = useUpdatePermissionMutation();
  const [deletePerm]      = useDeletePermissionMutation();

  const renderRow = (perm: Permission, actions: any[]) => (
    <tr key={perm.id}>
      <td>
        <code className="text-primary" style={{ fontSize: 12 }}>{perm.name}</code>
      </td>
      <td className="text-end pe-3">
        <RowActions actions={actions} />
      </td>
    </tr>
  );

  return (
    <AdminCrudPage<Permission>
      entity="Permission"
      query={query}
      mutations={{
        create: createPerm as any,
        update: updatePerm as any,
        delete: deletePerm as any,
      }}
      permissions={{
        create: can(PERMISSIONS.PERMISSION.MANAGE),
        update: can(PERMISSIONS.PERMISSION.MANAGE),
        delete: can(PERMISSIONS.PERMISSION.MANAGE),
      }}
      columns={<tr><th>Permission Name</th><th className="text-end">Actions</th></tr>}
      fields={[{ name: 'name', label: 'Permission Name', required: true, placeholder: 'e.g. user-view' }]}
      initialValues={{ name: '' } as Partial<Permission>}
      renderRow={renderRow}
    />
  );
}
