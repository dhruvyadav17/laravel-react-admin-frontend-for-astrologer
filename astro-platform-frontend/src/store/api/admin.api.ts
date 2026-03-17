import { baseApi } from "./baseApi";
import { createCrudEndpoints } from "../crudBuilder";
import type { User, Role, Permission } from "../../types/models";

/* ======================================================
   ADMIN API
====================================================== */

export const adminApi = baseApi.injectEndpoints({
  overrideExisting: false,

  endpoints: (builder) => ({

    /* ================= GENERIC CRUD ================= */

    ...createCrudEndpoints<User>(builder, {
      resource: "users",
      isPaginated: true,
    }),

    ...createCrudEndpoints<Role>(builder, {
      resource: "roles",
      isPaginated: false,
    }),

    ...createCrudEndpoints<Permission>(builder, {
      resource: "permissions",
      isPaginated: false,
    }),

    /* ================= USERS EXTRA ================= */

    restoreUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/users/${id}/restore`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    assignUserRoles: builder.mutation<
      { roles: string[] },
      { id: number; roles: string[] }
    >({
      query: ({ id, roles }) => ({
        url: `/admin/users/${id}/assign-role`,
        method: "POST",
        body: { roles },
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    getUserPermissions: builder.query<
      { permissions: Permission[]; assigned: string[] },
      number
    >({
      query: (id) => `/admin/users/${id}/permissions`,
      transformResponse: (res: any) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Users", id }],
    }),

    assignUserPermissions: builder.mutation<
      { assigned: string[] },
      { id: number; permissions: string[] }
    >({
      query: ({ id, permissions }) => ({
        url: `/admin/users/${id}/permissions`,
        method: "POST",
        body: { permissions },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Users", id }],
    }),

    /* ================= ROLES EXTRA ================= */

    getRolePermissions: builder.query<
      { permissions: Permission[]; assigned: string[] },
      number
    >({
      query: (id) => `/admin/roles/${id}/permissions`,
      transformResponse: (res: any) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Roles", id }],
    }),

    assignRolePermissions: builder.mutation<
      void,
      { id: number; permissions: string[] }
    >({
      query: ({ id, permissions }) => ({
        url: `/admin/roles/${id}/permissions`,
        method: "POST",
        body: { permissions },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Roles", id }],
    }),

    /* ================= SIDEBAR ================= */

    getSidebar: builder.query<any[], void>({
      query: () => "/admin/sidebar",
      transformResponse: (res: any) => res.data ?? [],
      providesTags: ["Sidebar"],
    }),

    /* ================= DASHBOARD ================= */

    getDashboardStats: builder.query<
      { total_users: number },
      void
    >({
      query: () => "/admin/dashboard/stats",
      transformResponse: (res: any) => res.data,
    }),

  }),
});
export const {

  /* ===== USERS ===== */
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,

  useRestoreUserMutation,
  useAssignUserRolesMutation,
  useGetUserPermissionsQuery,
  useAssignUserPermissionsMutation,

  /* ===== ROLES ===== */
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetRolePermissionsQuery,
  useAssignRolePermissionsMutation,

  /* ===== PERMISSIONS ===== */
  useGetPermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,

  /* ===== SIDEBAR ===== */
  useGetSidebarQuery,

  /* ===== DASHBOARD ===== */
  useGetDashboardStatsQuery,

} = adminApi;
