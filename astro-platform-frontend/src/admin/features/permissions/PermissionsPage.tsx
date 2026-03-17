import { memo, useMemo, useState } from "react";

import AdminTablePage from "../../components/page/AdminTablePage";
import RowActions from "../../components/table/RowActions";
import FormModal from "../../../components/common/FormModal";

import { useCrud } from "../../../hooks/useCrud";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useConfirmAction } from "../../../hooks/useConfirmAction";
import { useRowActions } from "../../hooks/useRowActions";

import {
  useGetPermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} from "../../../store/api";

import type { Permission } from "../../../types/models";
import { PERMISSIONS } from "../../../constants/rbac";
import { ICONS } from "../../../constants/ui";

function PermissionsPage() {
  const { can } = useAuth();
  const confirmAction = useConfirmAction();

  const [editingPermission, setEditingPermission] =
    useState<Permission | null>(null);

  const {
    data: permissions = [],
    isLoading,
    isError,
    refetch,
  } = useGetPermissionsQuery();

  const [createPermission] =
    useCreatePermissionMutation();
  const [updatePermission] =
    useUpdatePermissionMutation();
  const [deletePermission] =
    useDeletePermissionMutation();

  const crud = useCrud<Permission>({
    create: createPermission,
    update: updatePermission,
    remove: deletePermission,
    onSuccess: () =>
      setEditingPermission(null),
  });

  const handleDelete = (
    permission: Permission
  ) =>
    confirmAction({
      message:
        "Are you sure you want to delete this permission?",
      confirmLabel: "Delete Permission",
      onConfirm: async () =>
        crud.remove(permission.id),
    });

  const getRowActions = (
    permission: Permission
  ) =>
    useRowActions<Permission>({
      row: permission,

      edit: {
        enabled: can(
          PERMISSIONS.PERMISSION.MANAGE
        ),
        onClick: (p) =>
          setEditingPermission(p),
      },

      delete: {
        enabled: can(
          PERMISSIONS.PERMISSION.MANAGE
        ),
        onClick: handleDelete,
      },
    });

  const columns = useMemo(
    () => (
      <tr>
        <th>Name</th>
        <th className="text-end">
          Actions
        </th>
      </tr>
    ),
    []
  );

  const initialValues = { name: "" };

  return (
    <>
      <AdminTablePage
        title="Permissions"
        permission={
          PERMISSIONS.PERMISSION.MANAGE
        }
        actionLabel="Add Permission"
        actionIcon={ICONS.ADD}
        onAction={() =>
          setEditingPermission(
            {} as Permission
          )
        }
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        empty={
          !isLoading &&
          !isError &&
          permissions.length === 0
        }
        emptyText="No permissions found"
        columns={columns}
      >
        {!isLoading &&
          !isError &&
          permissions.map(
            (permission) => (
              <tr key={permission.id}>
                <td>
                  {permission.name}
                </td>
                <td className="text-end">
                  <RowActions
                    actions={getRowActions(
                      permission
                    )}
                  />
                </td>
              </tr>
            )
          )}
      </AdminTablePage>

      {editingPermission && (
        <FormModal
          title={
            editingPermission.id
              ? "Edit Permission"
              : "Add Permission"
          }
          entity={editingPermission}
          initialValues={initialValues}
          form={{
            values: editingPermission,
            errors: {},
            loading: crud.loading,
            setField: () => {},
            setAllValues: () => {},
            reset: () => {},
            create: () =>
              crud.create(editingPermission),
            update: (id: number) =>
              crud.update(id, editingPermission),
          }}
          onClose={() =>
            setEditingPermission(null)
          }
          fields={[
            {
              name: "name",
              label:
                "Permission Name",
              required: true,
            },
          ]}
        />
      )}
    </>
  );
}

export default memo(PermissionsPage);
