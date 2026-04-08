import { baseApi } from "./baseApi";
import type { User, Role, Permission } from "../../types/models";

/* ── Dashboard stats type ───────────────────── */
export interface DashboardStats {
  total_users: number;
  total_astrologers: number;
  total_consultations: number;
  online_astrologers: number;
  revenue: number;
}

export const adminApi = baseApi.injectEndpoints({
  overrideExisting: false,

  endpoints: (builder) => ({

    /* ───────────────── USERS CRUD ───────────────── */

    getUsers: builder.query<any, any>({
      query: (params) => ({
        url: "/admin/users",
        params,
      }),
      providesTags: [{ type: "Users", id: "LIST" }],
    }),

    createUser: builder.mutation<User, Partial<User>>({
      query: (data) => ({
        url: "/admin/users",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    updateUser: builder.mutation<
      User,
      { id: number; data: Partial<User> }
    >({
      query: ({ id, data }) => ({
        url: `/admin/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Users", id }],
    }),

    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    restoreUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/users/${id}/restore`,
        method: "PATCH",
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

    /* ───────────────── ROLES CRUD ───────────────── */

    getRoles: builder.query<Role[], void>({
      query: () => "/admin/roles",
      transformResponse: (res: any) => res.data ?? [],
      providesTags: [{ type: "Roles", id: "LIST" }],
    }),

    createRole: builder.mutation<Role, Partial<Role>>({
      query: (data) => ({
        url: "/admin/roles",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Roles", id: "LIST" }],
    }),

    updateRole: builder.mutation<
      Role,
      { id: number; data: Partial<Role> }
    >({
      query: ({ id, data }) => ({
        url: `/admin/roles/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Roles", id }],
    }),

    deleteRole: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Roles", id: "LIST" }],
    }),

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

    /* ─────────────── PERMISSIONS CRUD ───────────── */

    getPermissions: builder.query<Permission[], void>({
      query: () => "/admin/permissions",
      transformResponse: (res: any) => res.data ?? [],
      providesTags: [{ type: "Permissions", id: "LIST" }],
    }),

    createPermission: builder.mutation<Permission, Partial<Permission>>({
      query: (data) => ({
        url: "/admin/permissions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Permissions", id: "LIST" }],
    }),

    updatePermission: builder.mutation<
      Permission,
      { id: number; data: Partial<Permission> }
    >({
      query: ({ id, data }) => ({
        url: `/admin/permissions/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Permissions", id }],
    }),

    deletePermission: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/permissions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Permissions", id: "LIST" }],
    }),

    /* ─────────────── SIDEBAR ───────────── */

    getSidebar: builder.query<any[], void>({
      query: () => "/admin/sidebar",
      transformResponse: (res: any) => res.data ?? [],
      providesTags: ["Sidebar"],
    }),

    /* ─────────────── DASHBOARD ───────────── */

    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => "/admin/dashboard/stats",
      transformResponse: (res: any) => res.data ?? {},
      providesTags: ["Dashboard"],
    }),

  }),
});

/* ── Export hooks ───────────────────────────── */

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
  useAssignUserRolesMutation,
  useGetUserPermissionsQuery,
  useAssignUserPermissionsMutation,

  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetRolePermissionsQuery,
  useAssignRolePermissionsMutation,

  useGetPermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,

  useGetSidebarQuery,
  useGetDashboardStatsQuery,
} = adminApi;