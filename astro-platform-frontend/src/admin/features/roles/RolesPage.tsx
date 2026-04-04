// PATH: src/admin/features/roles/RolesPage.tsx
// FIX BUG-13: mutations format galat tha
//   BEFORE: create: createMutation → RTK [fn, state] tuple
//   AdminCrudPage expects: create: [(data) => Promise<void>]
//   Same issue AstrologersPage mein tha aur wahan fix tha — yahan miss ho gaya
// IMPROVEMENT: Role name badge show kiya — "super-admin" clearly highlighted

import { memo, useState }       from "react";
import AdminCrudPage             from "../../components/crud/AdminCrudPage";
import RowActions                from "../../../components/table/RowActions";
import AssignModal               from "../../components/modals/AssignModal";

import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from "../../../store/api";

import { ICONS }        from "../../../constants/ui";
import { PERMISSIONS }  from "../../../constants/rbac";
import { useAuth }      from "../../../auth/hooks/useAuth";
import type { Role }    from "../../../types/models";

/* ── Badge color per role ──────────────────────── */
const ROLE_COLORS: Record<string, string> = {
  "super-admin": "danger",
  "admin":       "warning",
  "manager":     "info",
  "astrologer":  "primary",
  "user":        "secondary",
};

function RolesPage() {
  const { can }                         = useAuth();
  const [assignData, setAssignData]     = useState<any>(null);

  const query                           = useGetRolesQuery();
  const [create]                        = useCreateRoleMutation();
  const [update]                        = useUpdateRoleMutation();
  const [remove]                        = useDeleteRoleMutation();

  const renderRow = (role: Role, actions: any[]) => {
    const color = ROLE_COLORS[role.name] ?? "secondary";
    return (
      <tr key={role.id}>
        <td>
          <span className={`badge bg-${color}-subtle text-${color} border px-3 py-2`}
            style={{ fontSize: 12 }}>
            {role.name || "—"}
          </span>
        </td>
        <td className="text-end pe-3">
          <RowActions actions={actions} />
        </td>
      </tr>
    );
  };

  const extraActions = [
    {
      key:   "permissions",
      icon:  ICONS.PERMISSION,
      title: "Assign Permissions",
      show:  can(PERMISSIONS.ROLE?.ASSIGN_PERMISSION ?? true),
      onClick: (role: Role) => setAssignData({ mode: "role-permission", entity: role }),
    },
  ];

  return (
    <>
      <AdminCrudPage<Role>
        entity="Role"
        query={query}
        mutations={{
          // FIX BUG-13: [async fn] format — not RTK tuple
          create:  [async (d: Partial<Role>) => { await create(d).unwrap(); }],
          update:  [async (d: Partial<Role> & { id: number }) => { await update(d).unwrap(); }],
          delete:  [async (id: number) => { await remove(id).unwrap(); }],
        }}
        permissions={{ create: true, delete: false }}
        columns={
          <tr>
            <th>Role Name</th>
            <th className="text-end">Actions</th>
          </tr>
        }
        renderRow={renderRow}
        initialValues={{ name: "" } as Partial<Role>}
        fields={[{ name: "name", label: "Role Name", required: true }]}
        extraActions={extraActions}
      />

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

export default memo(RolesPage);
