// PATH: src/admin/features/permissions/PermissionsPage.tsx
// FIX BUG-13: mutations format galat tha — same as RolesPage
//   BEFORE: create: createMutation → RTK [fn, state] tuple — wrong
//   AFTER:  create: [async (d) => { await create(d).unwrap(); }] — correct
// IMPROVEMENT: Permission name display — group prefix highlight kiya

import { memo }                  from "react";
import AdminCrudPage             from "../../../admin/components/crud/AdminCrudPage";
import RowActions                from "../../../components/table/RowActions";

import {
  useGetPermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} from "../../../store/api";

import type { Permission } from "../../../types/models";

/* ── Permission name display ───────────────────── */
// "user-view" → prefix "user" highlight, action "view"
function PermissionBadge({ name }: { name: string }) {
  const [prefix, ...rest] = name.split("-");
  const action = rest.join("-");

  const prefixColors: Record<string, string> = {
    user:        "primary",
    astrologer:  "success",
    role:        "warning",
    permission:  "danger",
  };
  const color = prefixColors[prefix] ?? "secondary";

  return (
    <span className="d-inline-flex align-items-center gap-1">
      <span className={`badge bg-${color}-subtle text-${color} border`}
        style={{ fontSize: 11 }}>
        {prefix}
      </span>
      {action && <span className="text-muted small">{action}</span>}
    </span>
  );
}

function PermissionsPage() {
  const query    = useGetPermissionsQuery();
  const [create] = useCreatePermissionMutation();
  const [update] = useUpdatePermissionMutation();
  const [remove] = useDeletePermissionMutation();

  const renderRow = (permission: Permission, actions: any[]) => (
    <tr key={permission.id}>
      <td>
        <PermissionBadge name={permission.name || "—"} />
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
        // FIX BUG-13: [async fn] format
        create: [async (d: Partial<Permission>) => { await create(d).unwrap(); }],
        update: [async (d: Partial<Permission> & { id: number }) => { await update(d).unwrap(); }],
        delete: [async (id: number) => { await remove(id).unwrap(); }],
      }}
      permissions={{ create: true }}
      columns={
        <tr>
          <th>Permission Name</th>
          <th className="text-end">Actions</th>
        </tr>
      }
      renderRow={renderRow}
      initialValues={{ name: "" } as Partial<Permission>}
      fields={[{ name: "name", label: "Permission Name", required: true,
        placeholder: "e.g. user-view, astrologer-create" }]}
    />
  );
}

export default memo(PermissionsPage);
