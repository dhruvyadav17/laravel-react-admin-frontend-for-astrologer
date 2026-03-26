import { memo, useMemo } from "react";
import AdminCrudPage from "../../components/crud/AdminCrudPage";
import RowActions from "../../../components/table/RowActions";

import {
  useGetPermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} from "../../../store/api";

function PermissionsPage() {
  /* ================= QUERY ================= */

  const query = useGetPermissionsQuery();

  /* ================= MUTATIONS ================= */

  const createMutation = useCreatePermissionMutation();
  const updateMutation = useUpdatePermissionMutation();
  const deleteMutation = useDeletePermissionMutation();

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

  const renderRow = (permission: any, actions: any[]) => (
    <tr key={permission.id}>
      <td>{permission.name || "—"}</td>
      <td className="text-end">
        <RowActions actions={actions} />
      </td>
    </tr>
  );

  return (
    <AdminCrudPage
      entity="Permission"
      query={query}
      mutations={{
        create: createMutation,
        update: updateMutation,
        delete: deleteMutation,
      }}
      permissions={{
        create: true,
      }}
      columns={columns}
      renderRow={renderRow}
      initialValues={{ name: "" }}
      fields={[
        {
          name: "name",
          label: "Permission Name",
          required: true,
        },
      ]}
    />
  );
}

export default memo(PermissionsPage);