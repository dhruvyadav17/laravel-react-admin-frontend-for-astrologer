import { memo, useMemo } from "react";
import AdminCrudPage from "../../components/crud/AdminCrudPage";

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
    []
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