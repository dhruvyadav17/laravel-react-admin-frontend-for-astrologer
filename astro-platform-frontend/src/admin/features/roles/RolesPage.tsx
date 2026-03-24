import { memo, useMemo } from "react";
import AdminCrudPage from "../../components/crud/AdminCrudPage";
import RowActions from "../../../components/table/RowActions";

import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from "../../../store/api";

function RolesPage() {
  const columns = useMemo(
    () => (
      <tr>
        <th>Name</th>
        <th className="text-end">Actions</th>
      </tr>
    ),
    [],
  );
  const renderRow = (role: any, actions: any[]) => (
    <tr key={role.id}>
      <td>{role.name || "—"}</td>
      <td className="text-end">
        <RowActions actions={actions} />
      </td>
    </tr>
  );
  return (
    <AdminCrudPage
      entity="Role"
      api={{
        list: useGetRolesQuery,
        create: useCreateRoleMutation,
        update: useUpdateRoleMutation,
        delete: useDeleteRoleMutation,
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
          label: "Role Name",
          required: true,
        },
      ]}
    />
  );
}

export default memo(RolesPage);
