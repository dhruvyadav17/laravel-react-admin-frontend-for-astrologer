import { memo, useMemo } from "react";
import AdminCrudPage from "../../components/crud/AdminCrudPage";
import { PERMISSIONS } from "../../../constants/rbac";

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
