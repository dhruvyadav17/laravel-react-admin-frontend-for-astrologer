import { useState } from "react";
import AdminCrudPage from "../../components/crud/AdminCrudPage";
import RowActions from "../../../components/table/RowActions";
import Pagination from "../../../components/table/Pagination";
import AssignModal from "../../components/modals/AssignModal";

import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useRestoreUserMutation ,
} from "../../../store/api";

import { usePagination } from "../../../hooks/usePagination";
import { useAuth } from "../../../auth/hooks/useAuth";

import { TableSearch } from "../../../components/table/table.helpers";

import { PERMISSIONS } from "../../../constants/rbac";
import { ICONS } from "../../../constants/ui";

import type { User } from "../../../types/models";

export default function UsersPage() {
  const { page, setPage, search, setSearch } = usePagination();
  const { can } = useAuth();

  const [assignData, setAssignData] = useState<any>(null);

  /* ================= QUERY ================= */

  const query = useGetUsersQuery({ page, search });

  const { data } = query;
  const meta = data?.meta;

  /* ================= MUTATIONS ================= */

  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const deleteMutation = useDeleteUserMutation();
  const restoreMutation = useRestoreUserMutation();
  /* ================= EXTRA ACTIONS ================= */

  const extraActions = [
    {
      key: "roles",
      icon: ICONS.ROLE,
      title: "Assign Roles",
      show: can(PERMISSIONS.USER.ASSIGN_ROLE),
      onClick: (user: User) =>
        setAssignData({
          mode: "user-role",
          entity: user,
        }),
    },
    {
      key: "permissions",
      icon: ICONS.PERMISSION,
      title: "Assign Permissions",
      show: can(PERMISSIONS.USER.ASSIGN_PERMISSION),
      onClick: (user: User) =>
        setAssignData({
          mode: "user-permission",
          entity: user,
        }),
    },
  ];

  return (
    <>
      <AdminCrudPage
        entity="User"
        query={query}
        mutations={{
          create: createMutation,
          update: updateMutation,
          delete: deleteMutation,
          restore: restoreMutation,
        }}
        permissions={{ create: true }}
        topContent={
          <TableSearch
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1); // reset page
            }}
            placeholder="Search users..."
          />
        }
        columns={
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Status</th>
            <th className="text-end">Actions</th>
          </tr>
        }
        renderRow={(user: User, actions) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.roles?.join(", ") || "—"}</td>
            <td>{user.deleted_at ? "Archived" : "Active"}</td>
            <td className="text-end">
              <RowActions actions={actions} />
            </td>
          </tr>
        )}
        extraActions={extraActions}
        initialValues={{
          name: "",
          email: "",
          password: "",
          password_confirmation: "",
          experience: "",
          price_per_minute: "",
          bio: "",
        }}
        fields={(entity: any) => {
          const isEdit = !!entity?.id;
          const isAstrologer = entity?.roles?.includes("astrologer");

          return [
            { name: "name", label: "Name", required: true },
            { name: "email", label: "Email", required: true, disabled: isEdit },

            // password only on create
            ...(!isEdit
              ? [
                  { name: "password", label: "Password", type: "password" },
                  {
                    name: "password_confirmation",
                    label: "Confirm Password",
                    type: "password",
                  },
                ]
              : []),

            // astrologer fields
            ...(isAstrologer
              ? [
                  { name: "experience", label: "Experience" },
                  { name: "price_per_minute", label: "Price/Min" },
                  { name: "bio", label: "Bio" },
                ]
              : []),
          ];
        }}
      />

      {/* ================= PAGINATION ================= */}
      {meta && meta.last_page > 1 && (
        <Pagination meta={meta} onPageChange={setPage} />
      )}

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