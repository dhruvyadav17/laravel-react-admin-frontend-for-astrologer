import { useState } from 'react';
import AdminCrudPage from '../../components/crud/AdminCrudPage';
import RowActions from '../../../../components/table/RowActions';
import Pagination from '../../../../components/table/Pagination';
import AssignModal from '../../components/AssignModal';
import { TableSearch } from '../../../../components/table/table.helpers';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
} from '../../../../store/admin.api';
import { usePagination } from '../../../../hooks/usePagination';
import { useAuth } from '../../../auth/hooks/useAuth';
import { PERMISSIONS } from '../../../../constants/rbac';
import { ICONS } from '../../../../constants/ui';
import api from '../../../../api/axios';
import { toast } from 'react-toastify';
import type { User, FieldConfig } from '../../../../types/models';

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
  const [assignData,  setAssignData]  = useState<any>(null);
  const [creditTarget, setCreditTarget] = useState<any>(null);
  const [creditAmt,    setCreditAmt]    = useState('');
  const [crediting,    setCrediting]    = useState(false);

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
      key: 'wallet-credit',
      icon: 'fas fa-wallet',
      title: 'Credit Wallet',
      show: can(PERMISSIONS.USER.UPDATE),
      onClick: () => setCreditTarget(user),
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
      {/* Wallet Credit Modal */}
      {creditTarget && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="rounded-4 shadow-lg p-4" style={{ width: 380, background: 'var(--surf)', border: '1px solid var(--bdr)' }}>
            <h6 className="fw-bold mb-1"><i className="fas fa-wallet me-2 text-success" />Credit Wallet</h6>
            <p className="t-muted small mb-3">Add funds to <strong>{creditTarget.name}</strong>'s wallet</p>
            <div className="input-group mb-3">
              <span className="input-group-text">₹</span>
              <input type="number" className="form-control" placeholder="Amount"
                value={creditAmt} min={1} max={100000}
                onChange={e => setCreditAmt(e.target.value)} autoFocus />
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary flex-grow-1"
                onClick={() => { setCreditTarget(null); setCreditAmt(''); }}>Cancel</button>
              <button className="btn btn-success flex-grow-1 fw-semibold"
                disabled={crediting || !creditAmt || parseFloat(creditAmt) < 1}
                onClick={async () => {
                  setCrediting(true);
                  try {
                    const res = await api.post(`/admin/users/${creditTarget.id}/wallet-credit`, { amount: parseFloat(creditAmt) });
                    toast.success(res.data?.message ?? 'Wallet credited!');
                    setCreditTarget(null); setCreditAmt('');
                    query.refetch?.();
                  } catch (err: any) {
                    toast.error(err?.response?.data?.message ?? 'Failed');
                  } finally { setCrediting(false); }
                }}>
                {crediting ? <span className="spinner-border spinner-border-sm" /> : `Credit ₹${creditAmt || 0}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminCrudPage<User>
        entity="User"
        query={query}
        mutations={{ create: createUser as any, update: updateUser as any, delete: deleteUser as any, restore: restoreUser as any }}
        permissions={{ create: can(PERMISSIONS.USER.CREATE) }}
        topContent={<TableSearch value={search} onChange={(val) => { setSearch(val); setPage(1); }} placeholder="Search users by name or email..." />}
        columns={<tr><th>Name</th><th>Email</th><th>Wallet</th><th>Roles</th><th>Status</th><th className="text-end">Actions</th></tr>}
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
            <td>
              {(user as any).wallet_balance !== undefined ? (
                <span className="fw-semibold" style={{ color: (user as any).wallet_balance > 0 ? '#16a34a' : 'var(--txt-l)', fontSize: 13 }}>
                  ₹{Number((user as any).wallet_balance).toFixed(0)}
                </span>
              ) : <span className="text-muted small">--</span>}
            </td>
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
