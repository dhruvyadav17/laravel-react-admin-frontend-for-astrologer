import { memo, useMemo, useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";
import { usePagination } from "../../../hooks/usePagination";
import { useConfirmAction } from "../../../hooks/useConfirmAction";
import { useCrud } from "../../../hooks/useCrud";

import AdminTablePage from "../../components/page/AdminTablePage";
import RowActions from "../../components/table/RowActions";
import AssignModal from "../../components/modals/AssignModal";
import FormModal from "../../../components/common/FormModal";

import Pagination from "../../../components/common/Pagination";
import {
  TableSearch,
  StatusBadge,
} from "../../../components/common/TableUtils";

import { useRowActions } from "../../hooks/useRowActions";

import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useRestoreUserMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../../../store/api";

import { execute } from "../../../utils/feedback";
import type { User } from "../../../types/models";
import { PERMISSIONS } from "../../../constants/rbac";
import { ICONS } from "../../../constants/ui";

function UsersPage() {
  const { page, setPage, search, setSearch } =
    usePagination();

  const { can } = useAuth();
  const confirmAction = useConfirmAction();

  /* ================= LOCAL MODAL STATE ================= */

  const [editingUser, setEditingUser] =
    useState<User | null>(null);

  const [assignData, setAssignData] =
    useState<{
      mode: "user-role" | "user-permission";
      entity: User;
    } | null>(null);

  /* ================= LOCAL FORM STATE ================= */

  const initialValues = {
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  };

  const [formValues, setFormValues] =
    useState(initialValues);

  const setField = (
    key: keyof typeof initialValues,
    value: any
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetForm = () =>
    setFormValues(initialValues);

  /* ================= QUERY ================= */

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetUsersQuery(
    { page, search },
    { refetchOnMountOrArgChange: true }
  );

  const users = data?.data ?? [];
  const meta = data?.meta;

  const [deleteUser] = useDeleteUserMutation();
  const [restoreUser] = useRestoreUserMutation();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const crud = useCrud<User>({
    create: createUser,
    update: updateUser,
    remove: deleteUser,
    onSuccess: () => {
      resetForm();
      setEditingUser(null);
    },
  });

  /* ================= EDIT SYNC ================= */

  const openEdit = (user: User | null) => {
    if (user) {
      setFormValues({
        ...initialValues,
        ...user,
      });
    } else {
      resetForm();
    }

    setEditingUser(user ?? ({} as User));
  };

  /* ================= ARCHIVE ================= */

  const handleArchive = (user: User) =>
    confirmAction({
      message:
        "Are you sure you want to archive this user?",
      confirmLabel: "Yes, Archive",
      onConfirm: async () =>
        crud.remove(user.id),
    });

  /* ================= RESTORE ================= */

  const handleRestore = (user: User) =>
    execute(
      () => restoreUser(user.id).unwrap(),
      {
        defaultMessage:
          "User restored successfully",
      }
    );

  /* ================= ROW ACTIONS ================= */

  const getRowActions = (user: User) =>
    useRowActions<User>({
      row: user,
      isDeleted: !!user.deleted_at,

      delete: {
        enabled: can(PERMISSIONS.USER.DELETE),
        onClick: handleArchive,
      },

      restore: {
        enabled: !!user.deleted_at,
        onClick: handleRestore,
      },

      edit: {
        enabled: can(PERMISSIONS.USER.UPDATE),
        onClick: () => openEdit(user),
      },

      extra: [
        {
          key: "roles",
          icon: ICONS.ROLE,
          title: "Assign Roles",
          show: can(
            PERMISSIONS.USER.ASSIGN_ROLE
          ),
          onClick: () =>
            setAssignData({
              mode: "user-role",
              entity: user,
            }),
        },
        {
          key: "permissions",
          icon: ICONS.PERMISSION,
          title: "Assign Permissions",
          show: can(
            PERMISSIONS.USER.ASSIGN_PERMISSION
          ),
          onClick: () =>
            setAssignData({
              mode: "user-permission",
              entity: user,
            }),
        },
      ],
    });

  /* ================= TABLE COLUMNS ================= */

  const columns = useMemo(
    () => (
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Roles</th>
        <th>Status</th>
        <th className="text-end">
          Actions
        </th>
      </tr>
    ),
    []
  );

  return (
    <>
      <AdminTablePage
        title="Users"
        permission={PERMISSIONS.USER.CREATE}
        actionLabel="Add User"
        actionIcon={ICONS.ADD}
        onAction={() => openEdit(null)}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        empty={
          !isLoading &&
          !isError &&
          users.length === 0
        }
        emptyText="No users found"
        columns={columns}
        topContent={
          <TableSearch
            value={search}
            onChange={setSearch}
            placeholder="Search by name or email..."
          />
        }
      >
        {!isLoading &&
          !isError &&
          users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                {user.roles?.join(", ") ||
                  "—"}
              </td>
              <td>
                {user.deleted_at ? (
                  <StatusBadge status="archived" />
                ) : (
                  <StatusBadge active />
                )}
              </td>
              <td className="text-end">
                <RowActions
                  actions={getRowActions(
                    user
                  )}
                />
              </td>
            </tr>
          ))}
      </AdminTablePage>

      {meta && !isError && (
        <Pagination
          meta={meta}
          onPageChange={setPage}
        />
      )}

      {/* ================= FORM MODAL ================= */}

      {editingUser && (
        <FormModal
          title={
            editingUser.id
              ? "Edit User"
              : "Add User"
          }
          entity={editingUser}
          initialValues={initialValues}
          form={{
            values: formValues,
            errors: {},
            loading: crud.loading,
            setField,
            setAllValues: setFormValues,
            reset: resetForm,
            create: () =>
              crud.create(formValues),
            update: (id: number) =>
              crud.update(id, formValues),
          }}
          onClose={() =>
            setEditingUser(null)
          }
          fields={[
            {
              name: "name",
              label: "Name",
              required: true,
            },
            {
              name: "email",
              label: "Email",
              type: "email",
              required: true,
            },
            {
              name: "password",
              label: "Password",
              type: "password",
              required: !editingUser?.id,
            },
            {
              name: "password_confirmation",
              label: "Confirm Password",
              type: "password",
              required: !editingUser?.id,
            },
          ]}
        />
      )}

      {assignData && (
        <AssignModal
          mode={assignData.mode}
          entity={assignData.entity}
          onClose={() =>
            setAssignData(null)
          }
        />
      )}
    </>
  );
}

export default memo(UsersPage);
