import { memo, useMemo, useState } from "react";

import AdminTablePage from "../../components/page/AdminTablePage";
import RowActions from "../../components/table/RowActions";
import AssignModal from "../../components/modals/AssignModal";
import FormModal from "../../../components/common/FormModal";

import { useCrud } from "../../../hooks/useCrud";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useConfirmAction } from "../../../hooks/useConfirmAction";
import { useRowActions } from "../../hooks/useRowActions";

import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from "../../../store/api";

import type { Role } from "../../../types/models";
import { PERMISSIONS } from "../../../constants/rbac";
import { ICONS } from "../../../constants/ui";

function RolesPage() {
  const { can } = useAuth();
  const confirmAction = useConfirmAction();

  const [editingRole, setEditingRole] =
    useState<Role | null>(null);

  const [assignRole, setAssignRole] =
    useState<Role | null>(null);

  const {
    data: roles = [],
    isLoading,
    isError,
    refetch,
  } = useGetRolesQuery();

  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const crud = useCrud<Role>({
    create: createRole,
    update: updateRole,
    remove: deleteRole,
    onSuccess: () => setEditingRole(null),
  });

  const handleDelete = (role: Role) =>
    confirmAction({
      message:
        "Are you sure you want to delete this role?",
      confirmLabel: "Delete Role",
      onConfirm: async () =>
        crud.remove(role.id),
    });

  const getRowActions = (role: Role) =>
    useRowActions<Role>({
      row: role,

      edit: {
        enabled: can(PERMISSIONS.ROLE.MANAGE),
        onClick: (r) =>
          setEditingRole(r),
      },

      delete: {
        enabled: can(PERMISSIONS.ROLE.MANAGE),
        onClick: handleDelete,
      },

      extra: [
        {
          key: "permissions",
          icon: ICONS.PERMISSION,
          title: "Assign Permissions",
          show: can(
            PERMISSIONS.ROLE.MANAGE
          ),
          onClick: (r) =>
            setAssignRole(r),
        },
      ],
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
        title="Roles"
        permission={PERMISSIONS.ROLE.MANAGE}
        actionLabel="Add Role"
        actionIcon={ICONS.ADD}
        onAction={() =>
          setEditingRole({} as Role)
        }
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        empty={
          !isLoading &&
          !isError &&
          roles.length === 0
        }
        emptyText="No roles found"
        columns={columns}
      >
        {!isLoading &&
          !isError &&
          roles.map((role) => (
            <tr key={role.id}>
              <td>{role.name}</td>
              <td className="text-end">
                <RowActions
                  actions={getRowActions(
                    role
                  )}
                />
              </td>
            </tr>
          ))}
      </AdminTablePage>

      {editingRole && (
        <FormModal
          title={
            editingRole.id
              ? "Edit Role"
              : "Add Role"
          }
          entity={editingRole}
          initialValues={initialValues}
          form={{
            values: editingRole,
            errors: {},
            loading: crud.loading,
            setField: () => {},
            setAllValues: () => {},
            reset: () => {},
            create: () =>
              crud.create(editingRole),
            update: (id: number) =>
              crud.update(id, editingRole),
          }}
          onClose={() =>
            setEditingRole(null)
          }
          fields={[
            {
              name: "name",
              label: "Role Name",
              required: true,
            },
          ]}
        />
      )}

      {assignRole && (
        <AssignModal
          mode="role-permission"
          entity={assignRole}
          onClose={() =>
            setAssignRole(null)
          }
        />
      )}
    </>
  );
}

export default memo(RolesPage);
