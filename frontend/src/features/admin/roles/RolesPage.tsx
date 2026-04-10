// PATH: src/features/admin/roles/RolesPage.tsx
// FIX: mutations format aligned with new AdminCrudPage API
//   RTK fn directly pass karo

import { memo, useState }  from 'react';
import AdminCrudPage        from '../../../admin/components/crud/AdminCrudPage';
import RowActions           from '../../../components/table/RowActions';
import AssignModal          from '../../../admin/components/modals/AssignModal';

import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from '../../../store/api';

import { ICONS }       from '../../../constants/ui';
import { PERMISSIONS } from '../../../constants/rbac';
import { useAuth }     from '../../../auth/hooks/useAuth';
import type { Role }   from '../../../types/models';

const ROLE_COLORS: Record<string, string> = {
  'super-admin': 'danger', 'admin': 'warning', 'manager': 'info',
  'astrologer': 'primary', 'user': 'secondary',
};

function RolesPage() {
  const { can }                     = useAuth();
  const [assignData, setAssignData] = useState<any>(null);

  const query        = useGetRolesQuery();
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const renderRow = (role: Role, actions: any[]) => {
    const color = ROLE_COLORS[role.name] ?? 'secondary';
    return (
      <tr key={role.id}>
        <td>
          <span className={`badge bg-${color}-subtle text-${color} border px-3 py-2`}
            style={{ fontSize: 12 }}>
            {role.name || '—'}
          </span>
        </td>
        <td className="text-end pe-3">
          <RowActions actions={actions} />
        </td>
      </tr>
    );
  };

  const extraActions = (role: Role) => [
    {
      key: 'permissions', icon: ICONS.PERMISSION, title: 'Assign Permissions',
      show: can(PERMISSIONS.ROLE.MANAGE),
      onClick: () => setAssignData({ mode: 'role-permission', entity: role }),
    },
  ];

  return (
    <>
      <AdminCrudPage<Role>
        entity="Role"
        query={query}
        mutations={{
          create: createRole as any,
          update: updateRole as any,
          delete: deleteRole as any,
        }}
        permissions={{
          create: can(PERMISSIONS.ROLE.MANAGE),
          update: can(PERMISSIONS.ROLE.MANAGE),
          delete: false,
        }}
        columns={<tr><th>Role Name</th><th className="text-end">Actions</th></tr>}
        fields={[{ name: 'name', label: 'Role Name', required: true }]}
        initialValues={{ name: '' } as Partial<Role>}
        renderRow={renderRow}
        extraActions={extraActions}
      />

      {assignData && (
        <AssignModal mode={assignData.mode} entity={assignData.entity}
          onClose={() => setAssignData(null)} />
      )}
    </>
  );
}

export default memo(RolesPage);
