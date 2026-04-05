// PATH: src/store/api/admin.api.ts
// FIX BUG-12: getDashboardStats return type sirf { total_users: number } tha
//              DashboardPage total_astrologers, total_consultations, revenue bhi use karta tha
//              TypeScript mein undefined tha — runtime mein always 0
//              Ab DashboardStats type complete hai

import { baseApi }             from "./baseApi";
import { createCrudEndpoints } from "../crudBuilder";
import type { User, Role, Permission } from "../../types/models";

/* ── Dashboard stats type ── FIX BUG-12 ────────── */
export interface DashboardStats {
  total_users:         number;
  total_astrologers:   number;  // was missing
  total_consultations: number;
  online_astrologers:   number;  // was missing
  revenue:             number;  // was missing
}

export const adminApi = baseApi.injectEndpoints({
  overrideExisting: false,

  endpoints: (builder) => ({

    /* ── Generic CRUD ─────────────────────────────── */
    ...createCrudEndpoints<User>(builder,       { resource: "users",       isPaginated: true  }),
    ...createCrudEndpoints<Role>(builder,       { resource: "roles",       isPaginated: false }),
    ...createCrudEndpoints<Permission>(builder, { resource: "permissions", isPaginated: false }),

    /* ── Users extra ──────────────────────────────── */
    restoreUser: builder.mutation<void, number>({
      query: (id) => ({ url: `/admin/users/${id}/restore`, method: "PATCH" }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    assignUserRoles: builder.mutation<
      { roles: string[] },
      { id: number; roles: string[] }
    >({
      query: ({ id, roles }) => ({
        url:    `/admin/users/${id}/assign-role`,
        method: "POST",
        body:   { roles },
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    getUserPermissions: builder.query<
      { permissions: Permission[]; assigned: string[] },
      number
    >({
      query:             (id) => `/admin/users/${id}/permissions`,
      transformResponse: (res: any) => res.data,
      providesTags:      (_r, _e, id) => [{ type: "Users", id }],
    }),

    assignUserPermissions: builder.mutation<
      { assigned: string[] },
      { id: number; permissions: string[] }
    >({
      query: ({ id, permissions }) => ({
        url:    `/admin/users/${id}/permissions`,
        method: "POST",
        body:   { permissions },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Users", id }],
    }),

    /* ── Roles extra ──────────────────────────────── */
    getRolePermissions: builder.query<
      { permissions: Permission[]; assigned: string[] },
      number
    >({
      query:             (id) => `/admin/roles/${id}/permissions`,
      transformResponse: (res: any) => res.data,
      providesTags:      (_r, _e, id) => [{ type: "Roles", id }],
    }),

    assignRolePermissions: builder.mutation<
      void,
      { id: number; permissions: string[] }
    >({
      query: ({ id, permissions }) => ({
        url:    `/admin/roles/${id}/permissions`,
        method: "POST",
        body:   { permissions },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Roles", id }],
    }),

    /* ── Sidebar ──────────────────────────────────── */
    getSidebar: builder.query<any[], void>({
      query:             () => "/admin/sidebar",
      transformResponse: (res: any) => res.data ?? [],
      providesTags:      ["Sidebar"],
    }),

    /* ── Dashboard stats — FIX BUG-12 ────────────── */
    // BEFORE: { total_users: number } — incomplete type
    // AFTER:  DashboardStats — all 4 fields typed
    getDashboardStats: builder.query<DashboardStats, void>({
      query:             () => "/admin/dashboard/stats",
      transformResponse: (res: any) => res.data ?? {},
      providesTags:      ["Dashboard"],
    }),
  }),
});

/* ── Export hooks ─────────────────────────────────── */
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
