import { useState } from "react";
import AdminCrudPage from "../../components/crud/AdminCrudPage";
import RowActions from "../../../components/table/RowActions";
import Pagination from "../../../components/table/Pagination";

import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
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

  // ✅ meta ke liye query
  const { data } = useGetUsersQuery({ page, search });
  const meta = data?.meta;

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
        api={{
          list: useGetUsersQuery,
          create: useCreateUserMutation,
          update: useUpdateUserMutation,
          delete: useDeleteUserMutation,
        }}
        permissions={{ create: true }}
        params={{ page, search }}
        topContent={
          <TableSearch
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1); // ✅ reset page on search
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
        renderRow={(user, actions) => (
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

            // ✅ password only in CREATE
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

            // ✅ astrologer fields
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

      {/* ✅ SAFE PAGINATION */}
      {meta && meta.last_page > 1 && (
        <Pagination meta={meta} onPageChange={setPage} />
      )}

      {/* Assign Modal */}
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
