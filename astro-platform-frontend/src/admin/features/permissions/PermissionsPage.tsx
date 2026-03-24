import { memo, useMemo } from "react";
import AdminCrudPage from "../../components/crud/AdminCrudPage";
import RowActions from "@/components/table/RowActions";

import {
  useGetPermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} from "../../../store/api";

function PermissionsPage() {
  const columns = useMemo(
    () => (
      <tr>
        <th>Name</th>
        <th className="text-end">Actions</th>
      </tr>
    ),
    [],
  );
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
      permissions={{
        create: true,
      }}
      api={{
        list: useGetPermissionsQuery,
        create: useCreatePermissionMutation,
        update: useUpdatePermissionMutation,
        delete: useDeletePermissionMutation,
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
