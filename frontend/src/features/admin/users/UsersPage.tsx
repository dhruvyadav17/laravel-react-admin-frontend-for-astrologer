import { useState } from 'react';
import AdminCrudPage from '../../../admin/components/crud/AdminCrudPage';
import RowActions from '../../../components/table/RowActions';
import Pagination from '../../../components/table/Pagination';
import AssignModal from '../../../admin/components/modals/AssignModal';
import { TableSearch } from '../../../components/table/table.helpers';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
} from '../../../store/api';
import { usePagination } from '../../../core/hooks/usePagination';
import { useAuth } from '../../../auth/hooks/useAuth';
import { PERMISSIONS } from '../../../constants/rbac';
import { ICONS } from '../../../constants/ui';
import type { User, FieldConfig } from '../../../types/models';

function RoleBadge({ role }: { role: string }) {
  const colorMap: Record<string, string> = {
    'super-admin': 'danger',
    admin: 'warning',
    manager: 'info',
    astrologer: 'primary',
    user: 'secondary',
  };
  const color = colorMap[role] ?? 'secondary';
  return <span className={`badge bg-${color}-subtle text-${color} border me-1`} style={{ fontSize: 11 }}>{role}</span>;
}

function buildFields(isEdit: boolean): FieldConfig<Partial<User>>[] {
  return [
    { name: 'name', label: 'Full Name', required: true },
    { name: 'email', label: 'Email', required: true, type: 'email', disabled: isEdit },
    ...(!isEdit ? [
      { name: 'password' as keyof User, label: 'Password', type: 'password' as const },
      { name: 'password_confirmation' as keyof User, label: 'Confirm Password', type: 'password' as const },
    ] : []),
  ];
}

export default function UsersPage() {
  const { page, setPage, search, setSearch } = usePagination();
  const { can } = useAuth();
  const [assignData, setAssignData] = useState<any>(null);

  const query = useGetUsersQuery({ page, search });
  const pagination = (query.data as any)?.pagination ?? (query.data as any)?.meta?.pagination;

  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [restoreUser] = useRestoreUserMutation();

  const extraActions = (user: User) => [
    {
      key: 'roles',
      icon: ICONS.ROLE,
      title: 'Assign Roles',
      show: can(PERMISSIONS.USER.ASSIGN_ROLE),
      onClick: () => setAssignData({ mode: 'user-role', entity: user }),
    },
    {
      key: 'permissions',
      icon: ICONS.PERMISSION,
      title: 'Assign Permissions',
      show: can(PERMISSIONS.USER.ASSIGN_PERMISSION),
      onClick: () => setAssignData({ mode: 'user-permission', entity: user }),
    },
  ];

  return (
    <>
      <AdminCrudPage<User>
        entity="User"
        query={query}
        mutations={{ create: createUser as any, update: updateUser as any, delete: deleteUser as any, restore: restoreUser as any }}
        permissions={{ create: can(PERMISSIONS.USER.CREATE) }}
        topContent={<TableSearch value={search} onChange={(val) => { setSearch(val); setPage(1); }} placeholder="Search users by name or email..." />}
        columns={<tr><th>Name</th><th>Email</th><th>Roles</th><th>Status</th><th className="text-end">Actions</th></tr>}
        fields={(editing) => buildFields(Boolean(editing?.id))}
        initialValues={{ name: '', email: '' } as Partial<User>}
        renderRow={(user: User, actions) => (
          <tr key={user.id} className={user.deleted_at ? 'table-secondary opacity-75' : ''}>
            <td>
              <div className="d-flex align-items-center gap-2">
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{ width: 30, height: 30, fontSize: 12 }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="fw-semibold small">{user.name}</span>
              </div>
            </td>
            <td className="small text-muted">{user.email}</td>
            <td>{user.roles?.length ? user.roles.map((r) => <RoleBadge key={r} role={r} />) : <span className="text-muted small">--</span>}</td>
            <td>{user.deleted_at ? <span className="badge bg-secondary">Archived</span> : <span className="badge bg-success">Active</span>}</td>
            <td className="text-end pe-3"><RowActions actions={actions} /></td>
          </tr>
        )}
        extraActions={extraActions}
      />

      {pagination && pagination.last_page > 1 && <Pagination meta={pagination} onPageChange={setPage} />}
      {assignData && <AssignModal mode={assignData.mode} entity={assignData.entity} onClose={() => setAssignData(null)} />}
    </>
  );
}
