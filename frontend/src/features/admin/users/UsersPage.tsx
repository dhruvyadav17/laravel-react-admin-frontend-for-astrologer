// PATH: src/admin/features/users/UsersPage.tsx

import { useState }            from "react";
import AdminCrudPage            from "../../../admin/components/crud/AdminCrudPage";
import RowActions               from "../../../components/table/RowActions";
import Pagination               from "../../../components/table/Pagination";
import AssignModal              from "../../../admin/components/modals/AssignModal";
import { TableSearch }          from "../../../components/table/table.helpers";

import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
} from "../../../store/api";

import { usePagination }  from "../../../core/hooks/usePagination";
import { useAuth }        from "../../../auth/hooks/useAuth";
import { PERMISSIONS }    from "../../../constants/rbac";
import { ICONS }          from "../../../constants/ui";
import type { User }      from "../../../types/models";

/* ── Role badge ───────────────────────────────────── */
function RoleBadge({ role }: { role: string }) {
  const colorMap: Record<string, string> = {
    "super-admin": "danger",
    "admin":       "warning",
    "manager":     "info",
    "astrologer":  "primary",
    "user":        "secondary",
  };
  const color = colorMap[role] ?? "secondary";
  return (
    <span className={`badge bg-${color}-subtle text-${color} border me-1`} style={{ fontSize: 11 }}>
      {role}
    </span>
  );
}

export default function UsersPage() {
  const { page, setPage, search, setSearch } = usePagination();
  const { can } = useAuth();
  const [assignData, setAssignData] = useState<any>(null);

  /* ── Query ────────────────────────────────────────── */
  const query               = useGetUsersQuery({ page, search });
  const { data }            = query;
  const meta                = (data as any)?.meta;

  /* ── Mutations ────────────────────────────────────── */
  const createMutation  = useCreateUserMutation();
  const updateMutation  = useUpdateUserMutation();
  const deleteMutation  = useDeleteUserMutation();
  const restoreMutation = useRestoreUserMutation();

  /* ── Extra row actions ────────────────────────────── */
  const extraActions = [
    {
      key:   "roles",
      icon:  ICONS.ROLE,
      title: "Assign Roles",
      show:  can(PERMISSIONS.USER.ASSIGN_ROLE),
      onClick: (user: User) => setAssignData({ mode: "user-role", entity: user }),
    },
    {
      key:   "permissions",
      icon:  ICONS.PERMISSION,
      title: "Assign Permissions",
      show:  can(PERMISSIONS.USER.ASSIGN_PERMISSION),
      onClick: (user: User) => setAssignData({ mode: "user-permission", entity: user }),
    },
  ];

  /* ── Fields (function — create vs edit) ───────────── */
  const fields = (entity: any) => {
    const isEdit = !!entity?.id;
    return [
      { name: "name",  label: "Full Name", required: true },
      { name: "email", label: "Email",     required: true, type: "email", disabled: isEdit },
      ...(!isEdit ? [
        { name: "password",              label: "Password",         type: "password" },
        { name: "password_confirmation", label: "Confirm Password", type: "password" },
      ] : []),
    ];
  };

  /* ── Render ───────────────────────────────────────── */
  return (
    <>
      <AdminCrudPage<User>
        entity="User"
        query={query}
        mutations={{
          create:  [async (d) => { await (createMutation[0] as any)(d).unwrap(); }],
          update:  [async (d: any) => { await (updateMutation[0] as any)({ id: d.id, ...d }).unwrap(); }],
          delete:  [async (id) => { await (deleteMutation[0] as any)(id).unwrap(); }],
          restore: [async (id) => { await (restoreMutation[0] as any)(id).unwrap(); }],
        }}
        permissions={{ create: true }}
        topContent={
          <TableSearch
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
            placeholder="Search users by name or email..."
          />
        }
        columns={
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Status</th>
            <th className="text-end">Actions</th>
          </tr>
        }
        renderRow={(user: User, actions) => (
          <tr key={user.id} className={user.deleted_at ? "table-secondary opacity-75" : ""}>
            {/* Name */}
            <td>
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                  style={{ width: 30, height: 30, fontSize: 12 }}
                >
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="fw-semibold small">{user.name}</span>
              </div>
            </td>

            {/* Email */}
            <td className="small text-muted">{user.email}</td>

            {/* Roles — IMPROVEMENT: badges */}
            <td>
              {user.roles?.length
                ? user.roles.map((r) => <RoleBadge key={r} role={r} />)
                : <span className="text-muted small">—</span>}
            </td>

            {/* Status — IMPROVEMENT: badges */}
            <td>
              {user.deleted_at ? (
                <span className="badge bg-secondary">Archived</span>
              ) : (
                <span className="badge bg-success">Active</span>
              )}
            </td>

            {/* Actions */}
            <td className="text-end pe-3">
              <RowActions actions={actions} row={user} />
            </td>
          </tr>
        )}
        extraActions={extraActions}
        initialValues={{ name: "", email: "" } as any}
        fields={fields as any}
      />

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <Pagination meta={meta} onPageChange={setPage} />
      )}

      {/* Assign Modal */}
      {assignData && (
        <AssignModal
          mode={assignData.mode}
          entity={assignData.entity}
          onClose={() => setAssignData(null)}
        />
      )}
    </>
  );
}
