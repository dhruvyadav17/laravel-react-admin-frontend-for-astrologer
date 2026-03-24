import { memo, useMemo } from "react";
import AdminCrudPage from "../../components/crud/AdminCrudPage";
import { PERMISSIONS } from "../../../constants/rbac";

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
