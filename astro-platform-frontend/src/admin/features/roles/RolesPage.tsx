import { memo, useMemo, useState } from "react";
import AdminCrudPage from "../../components/crud/AdminCrudPage";
import RowActions from "../../../components/table/RowActions";
import AssignModal from "../../components/modals/AssignModal";

import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from "../../../store/api";

import { ICONS } from "../../../constants/ui";
import { PERMISSIONS } from "../../../constants/rbac";
import { useAuth } from "../../../auth/hooks/useAuth";

function RolesPage() {
  const { can } = useAuth();
  const [assignData, setAssignData] = useState<any>(null);

  /* ================= QUERY ================= */

  const query = useGetRolesQuery();

  /* ================= MUTATIONS ================= */

  const createMutation = useCreateRoleMutation();
  const updateMutation = useUpdateRoleMutation();
  const deleteMutation = useDeleteRoleMutation();

  /* ================= COLUMNS ================= */

  const columns = useMemo(
    () => (
      <tr>
        <th>Name</th>
        <th className="text-end">Actions</th>
      </tr>
    ),
    []
  );

  /* ================= RENDER ================= */

  const renderRow = (role: any, actions: any[]) => (
    <tr key={role.id}>
      <td>{role.name || "—"}</td>
      <td className="text-end">
        <RowActions actions={actions} />
      </td>
    </tr>
  );

  /* ================= EXTRA ACTIONS ================= */

  const extraActions = [
    {
      key: "permissions",
      icon: ICONS.PERMISSION,
      title: "Assign Permissions",
      show: can(PERMISSIONS.ROLE?.ASSIGN_PERMISSION ?? true),
      onClick: (role: any) =>
        setAssignData({
          mode: "role-permission",
          entity: role,
        }),
    },
  ];

  return (
    <>
      <AdminCrudPage
        entity="Role"
        query={query}
        mutations={{
          create: createMutation,
          update: updateMutation,
          delete: deleteMutation,
        }}
        permissions={{
          create: true,
          delete: false,
        }}
        columns={columns}
        renderRow={renderRow}
        initialValues={{ name: "" }}
        fields={[
          {
            name: "name",
            label: "Role Name",
            required: true,
          },
        ]}
        extraActions={extraActions}
      />

      {/* ================= ASSIGN MODAL ================= */}
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